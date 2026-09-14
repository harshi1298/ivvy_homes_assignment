# Ivy Homes — Software Engineering Internship Solution
## Architecture Overview
```
IvyProject/             # Template for API credentials and candidate info
├── .env        
├── src/
│   ├── components/           # Navbar, PropertyCard, RentalCard, ProjectCard, AuthModal
│   ├── pages/                # ListingsPage, ListingDetailPage, RentalsPage, ProjectsPage, FavouritesPage, InsightsPage
│   ├── context/              # AuthContext (session timer, demo persistence, token storage)
│   ├── api.js                # Resilient API communication layer with client-side fallback
│   ├── App.jsx               # URL routing, tab state, and per-user favourites sync
│   └── index.css             # High-aesthetic design system (Slate/Indigo/Emerald palette)
├── submission.json           # Machine-scored answers and findings list
└── package.json              # Scripts and dependencies
```
---
## 🚀 How to Run
### 1. Configure Secrets in `.env`
```env
VITE_API_BASE_URL=https://solve.ivy.homes
VITE_API_KEY=IVY26-XXXXXXXXXXXX
VITE_DEMO_EMAIL=demo1@ivy.homes
CANDIDATE_REPO_URL=https://github.com/harshi1298/ivvy_homes_assignment
CANDIDATE_DEMO_URL=https://ivvy-homes-assignment.onrender.com/
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Frontend Application
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🕵️ How We Worked Out What to Distrust in the Documentation

The API reference was drafted by an AI assistant from an old changelog without human verification. To establish ground truth, we followed the core principle: **treat the running API server as the sole source of truth, and treat the documentation as unverified hypotheses.**

### 1. Inactive Listings Leakage (`/v1/listings`)
* **The Claim:** Documentation states that `/v1/listings` returns *only active sale listings* and that inactive, expired, and withdrawn listings are excluded server-side.
* **The Reality:** Retrievable records contain listings with `is_live === false` (449 inactive listings in our city).
* **The Fix:** The frontend explicitly checks `is_live` and provides an "Active Only" filter toggle so buyers only see active listings while allowing auditors to inspect withdrawn units.

### 2. Single Listing Detail Path (`/v1/listing/{id}` vs `/v1/listings/{id}`)
* **The Claim:** Documented endpoint is singular: `GET /v1/listing/{listing_id}`.
* **The Reality:** Probing returned `404 Not Found`. The actual running endpoint is plural: `GET /v1/listings/{listing_id}`.
* **The Fix:** `src/api.js` probes `/v1/listings/:id` first and falls back to `/v1/listing/:id` gracefully.

### 3. Auth Token Expiry & Undocumented Refresh Flow
* **The Claim:** "Tokens are valid for 24 hours (expires_in: 86400), so a single login is enough for one working session. There is no refresh flow."
* **The Reality:** `POST /auth/login` returns `expires_in: 900` (15 minutes), along with a `refresh_token` and `refresh_url: "/auth/refresh"`.
* **The Fix:** `src/api.js` intercepts `401 Unauthorized` responses and automatically calls `POST /auth/refresh` using the stored refresh token to transparently renew the session, guaranteeing the app stays active past 30 minutes.

### 4. Collection Pagination: `page` Ignored, `offset` Required, Limit Clamped
* **The Claim:** Every collection takes `page` (1-indexed) and `limit` (max 200).
* **The Reality:** The server quietly ignores `page` (always returning page 1 unless `offset` is passed) and clamps `limit` to a maximum of 50.
* **The Fix:** `scripts/harvest.js` and the frontend use explicit `offset=(page - 1) * limit` with `limit <= 50`.

### 5. Missing Endpoints (`/similar`, `/analytics/summary`, `/favourites`)
* **The Claim:** Documented endpoints for `GET /v1/listings/{id}/similar`, `GET /v1/analytics/summary`, and `GET/POST /v1/favourites`.
* **The Reality:** All three return `404 Not Found`.
* **The Fix:**
  - Similar listings: Computed client-side by matching locality, bedroom count, and ±15% price range.
  - Analytics summary: Calculated directly from harvested data and live listing records on the Insights screen.
  - Favourites: Synced to `/v1/saved` with per-user persistent fallback in `localStorage`.

### 6. Project `total_listings` Count Drift
* **The Claim:** `total_listings` in `GET /v1/projects` is automatically recomputed and always matches `GET /v1/listings?project_id=...`.
* **The Reality:** 264 out of 300 projects report counts that disagree with the actual number of listings referencing that `project_id`.
* **The Fix:** The frontend computes and displays both reported and verified listing counts on project cards.

### 7. Physically Impossible & Lead-Generation Listings
* **The Claim:** "Each listing corresponds to exactly one physical property with verified specs."
* **The Reality:** 11 listings describe physical impossibilities (floor > total_floors, carpet area > super built-up area, negative prices), and 3 listings represent lead-generation spam with prices of ₹10–12/sqft (vs market median ~₹9,991/sqft).
* **The Fix:** Filtered out from 2BHK benchmark analytics (Question 6) and highlighted as data quality flags in the Insights screen.

---

## 🧪 Hypotheses Tested That Turned Out Fine (Negative Results)

Evaluating what turned out *not* to be broken is just as critical for understanding the system:

1. **Hypothesis: Price units were in Lakhs or Crores rather than absolute rupees.**
   * *Investigation:* We checked whether sale `price` or rental `price` was reported in abbreviated units (e.g. `45` or `0.45` Lakhs).
   * *Result:* Fine. Sale and rental prices across listings and rentals are consistently formatted in full integer Indian Rupees.
2. **Hypothesis: Area was reported in square meters or square yards instead of square feet.**
   * *Investigation:* Audited `carpet_area` distributions and bedroom-to-area ratios across 2BHK and 3BHK flats.
   * *Result:* Fine. Carpet areas range realistically between 500 and 3,500 sq ft, confirming square feet conventions.
3. **Hypothesis: Geographic coordinates (latitude/longitude) were swapped or out of bounds.**
   * *Investigation:* Validated all coordinates against bounding boxes for Chennai (lat 12.8–13.2° N, lng 80.1–80.4° E).
   * *Result:* Fine. Coordinates cleanly map within the expected metropolitan city boundaries.
4. **Hypothesis: Bedroom and bathroom counts were stored as text (e.g. "3 BHK") causing NaN.**
   * *Investigation:* Inspected data types and parsed values for `bedroom`, `bathroom`, and `balcony`.
   * *Result:* Fine. All count attributes are cleanly typed numeric values across all records.

---

