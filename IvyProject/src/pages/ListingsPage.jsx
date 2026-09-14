import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, AlertCircle, Home, IndianRupee, Layers } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { getListings } from '../api';

const COMMON_LOCALITIES = [
  'all',
  'omr',
  'thoraipakkam',
  'sholinganallur',
  'perungudi',
  'velachery',
  'guindy',
  'anna nagar',
  't nagar',
  'ecr',
  'medavakkam',
  'porur',
  'tambaram',
  'koramangala',
  'whitefield',
  'indiranagar',
  'hsr layout',
  'bellandur',
  'electronic city'
];

export default function ListingsPage({ onSelectListing, favourites, onToggleFavourite }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pure API Query Filters (No frontend business logic filtering)
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [customLocality, setCustomLocality] = useState('');
  const [selectedBhk, setSelectedBhk] = useState('all');
  const [selectedFurnishing, setSelectedFurnishing] = useState('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Limit: default 20, maximum 100 (explicitly sent on every request)
  const [limit, setLimit] = useState(20);

  // Pagination (1-indexed)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Active locality is custom text if filled, otherwise dropdown selection
  const activeLocality = customLocality.trim() || (selectedLocality !== 'all' ? selectedLocality : '');

  // Fetch all new data from the API whenever ANY filter, limit, or page changes
  useEffect(() => {
    fetchData();
  }, [selectedLocality, customLocality, selectedBhk, selectedFurnishing, selectedPropertyType, minPrice, maxPrice, sortBy, limit, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build API query parameters strictly according to API_REFERENCE
      // Limit is explicitly enforced: default 20, maximum 100
      const enforcedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const params = {
        page: currentPage,
        limit: enforcedLimit
      };

      if (activeLocality) {
        params.locality = activeLocality.toLowerCase().trim();
      }

      if (selectedBhk !== 'all') {
        params.bhk = parseInt(selectedBhk, 10);
      }

      if (selectedFurnishing !== 'all') {
        params.furnishing = selectedFurnishing.toLowerCase().trim();
      }

      if (selectedPropertyType !== 'all') {
        params.property_type = selectedPropertyType.toLowerCase().trim();
      }

      if (minPrice && !isNaN(minPrice)) {
        params.min_price = parseInt(minPrice, 10);
      }

      if (maxPrice && !isNaN(maxPrice)) {
        params.max_price = parseInt(maxPrice, 10);
      }

      // Sort criteria sent to API
      if (sortBy === 'price_asc') {
        params.sort_by = 'price';
        params.order = 'asc';
      } else if (sortBy === 'price_desc') {
        params.sort_by = 'price';
        params.order = 'desc';
      } else if (sortBy === 'area_desc') {
        params.sort_by = 'carpet_area';
        params.order = 'desc';
      } else if (sortBy === 'newest') {
        params.sort_by = 'posted_at';
        params.order = 'desc';
      }

      // Pure API call: all results come directly from the backend
      const res = await getListings(params);

      // Directly use results returned by API without any frontend business logic filtering
      setListings(res.results || []);
      setTotalCount(res.total !== undefined ? res.total : (res.results?.length || 0));
    } catch (err) {
      console.error('API fetch error:', err);
      setError(err.message || 'Error fetching listings from server');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const enforcedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const totalPages = Math.ceil(totalCount / enforcedLimit) || 1;
  const isFav = (id) => favourites.some(f => (f.listing_id || f.id) === id);

  return (
    <div className="animate-fade-in">
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Explore Verified <span className="gradient-text">Properties for Sale</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Real-time API query-driven listings directly from backend database.
        </p>

        {/* Filter Controls Container */}
        <div className="card glass-panel" style={{ marginTop: '1.5rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Top Row: Locality Custom Search, Sort & Refresh */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Type locality (e.g. omr, velachery, whitefield)..."
                value={customLocality}
                onChange={(e) => { 
                  setCustomLocality(e.target.value); 
                  if (e.target.value) setSelectedLocality('all');
                  setCurrentPage(1); 
                }}
                style={{ width: '100%', paddingLeft: '1rem' }}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              style={{ minWidth: '170px' }}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_desc">Largest Area</option>
            </select>

            <button
              onClick={fetchData}
              className="btn btn-secondary"
              title="Re-query API"
              style={{ padding: '0.65rem' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Bottom Row: Detailed API Query Parameters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
            
            {/* Quick Locality Dropdown */}
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Locality Preset
              </label>
              <select
                value={selectedLocality}
                onChange={(e) => { 
                  setSelectedLocality(e.target.value); 
                  setCustomLocality('');
                  setCurrentPage(1); 
                }}
                style={{ width: '100%', textTransform: 'capitalize' }}
              >
                <option value="all">All Localities</option>
                {COMMON_LOCALITIES.filter(l => l !== 'all').map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* BHK Filter */}
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Bedrooms (BHK)
              </label>
              <select
                value={selectedBhk}
                onChange={(e) => { setSelectedBhk(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%' }}
              >
                <option value="all">Any BHK</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>

            {/* Property Type Filter */}
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Property Type
              </label>
              <select
                value={selectedPropertyType}
                onChange={(e) => { setSelectedPropertyType(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%' }}
              >
                <option value="all">All Property Types</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="independent house">Independent House</option>
                <option value="plot">Plot</option>
                <option value="builder floor">Builder Floor</option>
              </select>
            </div>

            {/* Furnishing */}
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Furnishing
              </label>
              <select
                value={selectedFurnishing}
                onChange={(e) => { setSelectedFurnishing(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%' }}
              >
                <option value="all">All Furnishing</option>
                <option value="unfurnished">Unfurnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="fully-furnished">Fully-Furnished</option>
              </select>
            </div>

            {/* Min Budget */}
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Min Price (₹)
              </label>
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%' }}
              />
            </div>

            {/* Max Budget */}
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Max Price (₹)
              </label>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%' }}
              />
            </div>

            {/* Limit Per Page (Default 20, Max 100, explicitly passed) */}
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                API Limit (Req)
              </label>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setCurrentPage(1); }}
                style={{ width: '100%', fontWeight: 600, color: 'var(--accent-primary)' }}
              >
                <option value={20}>20 per page (Default)</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page (Max)</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* Results Count & Query Metadata */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          API Results: <strong>{listings.length}</strong> items returned (Page {currentPage} of {totalPages}, Total: {totalCount})
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Query Limit: <code>limit={enforcedLimit}</code> (Default 20, Max 100)
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          background: 'var(--danger-bg)',
          color: 'var(--danger)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <AlertCircle size={22} />
          <div>
            <strong>API Query Response Error:</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton or Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--accent-primary)' }} />
          Querying backend API for updated listings...
        </div>
      ) : listings.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Filter size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No listings returned by the API</h3>
          <p style={{ fontSize: '0.9rem' }}>Try clearing or relaxing your query parameters.</p>
        </div>
      ) : (
        /* Pure API Results Grid */
        <div className="property-grid">
          {listings.map(listing => (
            <PropertyCard
              key={listing.listing_id}
              listing={listing}
              isFavourite={isFav(listing.listing_id)}
              onToggleFavourite={onToggleFavourite}
              onSelect={onSelectListing}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '2.5rem' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
            style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}
