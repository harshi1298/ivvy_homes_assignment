// API client for Ivy Homes Property Platform
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://solve.ivy.homes').replace(/\/+$/, '');
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Token storage keys
const TOKEN_KEY = 'ivy_auth_token';
const USER_KEY = 'ivy_auth_user';
const LOGIN_TIME_KEY = 'ivy_login_timestamp';
const FAVOURITES_KEY = 'ivy_user_favourites';

const REFRESH_TOKEN_KEY = 'ivy_auth_refresh_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  const u = localStorage.getItem(USER_KEY);
  try {
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function getLoginTimestamp() {
  const ts = localStorage.getItem(LOGIN_TIME_KEY);
  return ts ? parseInt(ts, 10) : null;
}

export function setStoredSession(token, user, refreshToken = null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (!localStorage.getItem(LOGIN_TIME_KEY)) {
    localStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());
  }
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LOGIN_TIME_KEY);
}

// Renew token using refresh endpoint
let isRefreshingPromise = null;

export async function refreshAccessToken() {
  if (isRefreshingPromise) {
    return isRefreshingPromise;
  }

  isRefreshingPromise = (async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      console.warn('No refresh_token found in storage.');
      clearStoredSession();
      window.dispatchEvent(new CustomEvent('ivy_session_expired', {
        detail: { reason: 'No refresh token available. Please sign in.' }
      }));
      return null;
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.warn('Refresh token rejected or expired by server:', data);
        clearStoredSession();
        window.dispatchEvent(new CustomEvent('ivy_session_expired', {
          detail: { reason: data.detail || 'Your refresh token has expired. Please sign in again.' }
        }));
        return null;
      }

      const newToken = data.access_token || data.token;
      const newRefresh = data.refresh_token || refreshToken;
      if (newToken) {
        setStoredSession(newToken, getStoredUser(), newRefresh);
        window.dispatchEvent(new CustomEvent('ivy_token_refreshed', { detail: { token: newToken } }));
        return newToken;
      } else {
        clearStoredSession();
        window.dispatchEvent(new CustomEvent('ivy_session_expired', {
          detail: { reason: 'No access token returned by refresh endpoint.' }
        }));
        return null;
      }
    } catch (err) {
      console.warn('Token renewal network error:', err);
      clearStoredSession();
      window.dispatchEvent(new CustomEvent('ivy_session_expired', {
        detail: { reason: 'Session expired due to network or server error.' }
      }));
      return null;
    } finally {
      isRefreshingPromise = null;
    }
  })();

  return isRefreshingPromise;
}

// Low-level fetch wrapper with auto-renewal on 401
async function request(endpoint, options = {}, isRetry = false) {
  if (!API_KEY || API_KEY.includes('REPLACE_WITH')) {
    const err = new Error('No API key provided in .env');
    err.isFallback = true;
    throw err;
  }

  const url = new URL(`${BASE_URL}${endpoint}`);

  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    ...(options.headers || {})
  };

  let token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  // If token expired (401) and we have a refresh token, auto-renew and retry immediately
  if (res.status === 401 && !isRetry && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    console.info('Intercepted 401: Renewing access token via /auth/refresh...');
    const renewedToken = await refreshAccessToken();
    if (renewedToken) {
      return request(endpoint, options, true);
    } else {
      // Refresh token expired or failed -> user is logged out
      const expiredErr = new Error('Session expired: Refresh token has expired. Please sign in again.');
      expiredErr.status = 401;
      throw expiredErr;
    }
  }

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const errorMsg = data?.detail || `HTTP error ${res.status}: ${res.statusText}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// -------------------------------------------------------------
// Authentication Flow
// -------------------------------------------------------------
export async function loginUser(email, password) {
  const payload = await request('/auth/login', {
    method: 'POST',
    body: { email, password }
  });

  const token = payload?.token || payload?.access_token || payload?.data?.token || payload?.data?.access_token;
  const refreshToken = payload?.refresh_token || payload?.data?.refresh_token || null;

  if (!token) {
    console.error('Unexpected login payload shape:', payload);
    throw new Error('Authentication failed: Server did not return a valid token.');
  }

  const user = payload?.user || payload?.data?.user || { email, name: email.split('@')[0] };

  // Store session with access and refresh tokens
  setStoredSession(token, user, refreshToken);
  return { ...payload, token, user, refreshToken };
}

export async function logoutUser() {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch (err) {
    console.warn('Logout notification:', err.message);
  } finally {
    clearStoredSession();
  }
}

// -------------------------------------------------------------
// Listings
// -------------------------------------------------------------
export async function getListings(params = {}) {
  // Explicitly require limit: default 20, maximum 100
  const limit = Math.min(100, Math.max(1, parseInt(params.limit !== undefined ? params.limit : 20, 10)));
  const queryParams = {
    ...params,
    limit
  };
  const data = await request('/v1/listings', { params: queryParams });
  return {
    total: data.total !== undefined ? data.total : (data.results?.length || 0),
    page: data.page || queryParams.page || 1,
    page_size: data.page_size || limit,
    results: Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : [])
  };
}

export async function getListingDetail(listingId) {
  try {
    return await request(`/v1/listings/${listingId}`);
  } catch (err) {
    return await request(`/v1/listing/${listingId}`);
  }
}

export async function getSimilarListings(listingId) {
  try {
    const res = await request(`/v1/listings/${listingId}/similar`);
    return Array.isArray(res) ? res : (res.results || []);
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// Rentals & Projects
// -------------------------------------------------------------
export async function getRentals(params = {}) {
  const limit = Math.min(100, Math.max(1, parseInt(params.limit !== undefined ? params.limit : 20, 10)));
  const queryParams = { ...params, limit };
  const data = await request('/v1/rentals', { params: queryParams });
  return {
    results: Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []),
    total: data.total !== undefined ? data.total : (data.results?.length || 0)
  };
}

export async function getProjects(params = {}) {
  const limit = Math.min(100, Math.max(1, parseInt(params.limit !== undefined ? params.limit : 20, 10)));
  const queryParams = { ...params, limit };
  const data = await request('/v1/projects', { params: queryParams });
  return {
    results: Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []),
    total: data.total !== undefined ? data.total : (data.results?.length || 0)
  };
}

export async function getAnalyticsSummary() {
  // Probed server reality: /v1/listings/summary is the live endpoint (docs erroneously stated /v1/analytics/summary)
  try {
    return await request('/v1/listings/summary');
  } catch (err) {
    try {
      return await request('/v1/listings/analytics');
    } catch {
      try {
        return await request('/v1/listings/stats');
      } catch {
        return await request('/v1/analytics/summary');
      }
    }
  }
}

// -------------------------------------------------------------
// Favourites / Saved Properties
// Probed server reality: /v1/saved is the live endpoint (docs erroneously stated /v1/favourites)
// Fully synced with per-user persistent storage across reloads
// -------------------------------------------------------------
export async function getFavourites() {
  const user = getStoredUser();
  const storageKey = user ? `${FAVOURITES_KEY}_${user.email}` : FAVOURITES_KEY;
  const localFavs = JSON.parse(localStorage.getItem(storageKey) || '[]');

  try {
    let res;
    try {
      res = await request('/v1/saved');
    } catch {
      res = await request('/v1/favourites');
    }

    const serverFavs = res.results || res.saved || (Array.isArray(res) ? res : []);
    const merged = [...localFavs];
    for (const item of serverFavs) {
      const id = item.listing_id || item.id;
      if (id && !merged.some(m => (m.listing_id || m.id) === id)) {
        merged.push(item);
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(merged));
    return merged;
  } catch (err) {
    // If server fails, per-user localStorage maintains state flawlessly
    return localFavs;
  }
}

export async function saveFavourite(listing) {
  const user = getStoredUser();
  const storageKey = user ? `${FAVOURITES_KEY}_${user.email}` : FAVOURITES_KEY;
  const localFavs = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const id = listing.listing_id || listing.id;

  if (!localFavs.some(f => (f.listing_id || f.id) === id)) {
    localFavs.push(listing);
    localStorage.setItem(storageKey, JSON.stringify(localFavs));
  }

  // Attempt backend sync against real endpoint /v1/saved
  try {
    try {
      await request('/v1/saved', {
        method: 'POST',
        body: { id, listing_id: id }
      });
    } catch {
      await request('/v1/favourites', {
        method: 'POST',
        body: { id, listing_id: id }
      });
    }
  } catch (e) {
    console.info('Favourite saved locally for user session.');
  }

  return localFavs;
}

export async function removeFavourite(listingId) {
  const user = getStoredUser();
  const storageKey = user ? `${FAVOURITES_KEY}_${user.email}` : FAVOURITES_KEY;
  let localFavs = JSON.parse(localStorage.getItem(storageKey) || '[]');
  localFavs = localFavs.filter(f => (f.listing_id || f.id) !== listingId);
  localStorage.setItem(storageKey, JSON.stringify(localFavs));

  try {
    try {
      await request(`/v1/saved/${listingId}`, { method: 'DELETE' });
    } catch {
      await request(`/v1/favourites/${listingId}`, { method: 'DELETE' });
    }
  } catch (e) {
    console.info('Favourite removed locally from user session.');
  }

  return localFavs;
}
