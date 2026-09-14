import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Layers, 
  Compass, 
  Car, 
  CheckCircle2, 
  Heart, 
  Phone, 
  Calendar, 
  Share2,
  AlertTriangle,
  Building
} from 'lucide-react';
import { getListingDetail, getSimilarListings } from '../api';
import PropertyCard, { formatPrice } from '../components/PropertyCard';

export default function ListingDetailPage({ listingId, onBack, onSelectListing, favourites, onToggleFavourite }) {
  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    loadDetail();
    window.scrollTo(0, 0);
  }, [listingId]);

  const loadDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getListingDetail(listingId);
      setListing(data);

      // Fetch similar listings
      try {
        const sim = await getSimilarListings(listingId);
        setSimilarListings(sim);
      } catch (e) {
        console.warn('Could not load similar listings:', e.message);
      }
    } catch (err) {
      console.warn('Failed to fetch from API, looking for local harvest fallback...', err);
      try {
        const localRes = await fetch('/data/listings.json');
        if (localRes.ok) {
          const all = await localRes.json();
          const found = all.find(l => l.listing_id === listingId);
          if (found) {
            setListing(found);
            // Calculate similar client-side
            const sim = all.filter(l => 
              l.listing_id !== listingId &&
              l.locality === found.locality &&
              l.bedroom === found.bedroom &&
              Math.abs(l.price - found.price) / found.price <= 0.25
            ).slice(0, 4);
            setSimilarListings(sim);
          } else {
            setError('Listing record not found.');
          }
        }
      } catch {
        setError(err.message || 'Error loading listing detail');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFav = favourites.some(f => (f.listing_id || f.id) === listingId);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        Loading property specifications...
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertTriangle size={40} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Failed to Load Listing</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error || 'Listing not found'}</p>
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back to Listings
        </button>
      </div>
    );
  }

  const {
    apartment_name,
    locality,
    property_type,
    bedroom,
    bathroom,
    balcony,
    floor,
    total_floors,
    furnishing,
    facing_direction,
    covered_parking,
    price,
    carpet_area,
    super_built_up_area,
    posted_by,
    posted_by_name,
    posted_by_contact,
    project_id,
    description,
    posted_at,
    is_verified,
    is_live
  } = listing;

  const pricePerSqft = (price && carpet_area && carpet_area > 0)
    ? Math.round(price / carpet_area)
    : null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1080px', margin: '0 auto' }}>
      
      {/* Back button & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button onClick={onBack} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={18} />
          <span>Back to all listings</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleShare} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Share2 size={16} />
            {copied ? 'Copied Link!' : 'Share'}
          </button>

          <button
            onClick={() => onToggleFavourite(listing)}
            className={`btn ${isFav ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <Heart size={16} fill={isFav ? '#ffffff' : 'none'} />
            {isFav ? 'Saved in Favourites' : 'Save to Favourites'}
          </button>
        </div>
      </div>

      {/* Main Showcase Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #1e293b 100%)',
        padding: '2.5rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)'
      }}>
        
        {/* Top Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {is_verified && (
            <span className="badge badge-verified">
              <CheckCircle2 size={13} /> Verified Property
            </span>
          )}
          {is_live === false ? (
            <span className="badge badge-warning">
              <AlertTriangle size={13} /> Inactive Listing
            </span>
          ) : (
            <span className="badge badge-verified" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              Live Listing
            </span>
          )}
          <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
            {property_type || 'Apartment'}
          </span>
          {project_id && (
            <span className="badge badge-neutral" style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}>
              Project ID: {project_id}
            </span>
          )}
        </div>

        {/* Title and Locality */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {apartment_name || `${bedroom} BHK Apartment`}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '1.05rem', textTransform: 'capitalize' }}>
              <MapPin size={18} color="var(--accent-primary)" />
              <span>{locality || 'Bangalore'}</span>
              {floor !== undefined && total_floors !== undefined && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  • Floor {floor} of {total_floors}
                </span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff' }}>
              {formatPrice(price)}
            </div>
            {pricePerSqft && (
              <div style={{ fontSize: '1rem', color: '#94a3b8' }}>
                ₹{pricePerSqft.toLocaleString('en-IN')} per sq.ft
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Grid: 2 Column Layout (Specs & Contact) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Left Column: Specifications & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Key Overview Cards */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>Property Overview</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Bedrooms</span>
                <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Bed size={18} color="var(--accent-primary)" /> {bedroom ? `${bedroom} BHK` : '—'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Bathrooms</span>
                <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Bath size={18} color="var(--accent-primary)" /> {bathroom || '—'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Carpet Area</span>
                <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Square size={18} color="var(--accent-primary)" /> {carpet_area ? `${carpet_area} sqft` : '—'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Super Built-Up</span>
                <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Layers size={18} color="var(--accent-primary)" /> {super_built_up_area ? `${super_built_up_area} sqft` : '—'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Facing</span>
                <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                  <Compass size={18} color="var(--accent-primary)" /> {facing_direction || 'East'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Parking</span>
                <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Car size={18} color="var(--accent-primary)" /> {covered_parking ? `${covered_parking} Covered` : 'Open'}
                </strong>
              </div>
            </div>
          </div>

          {/* Detailed Specifications Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>Detailed Specifications</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Furnishing Status</span>
                <strong style={{ textTransform: 'capitalize' }}>{furnishing ? furnishing.replace('-', ' ') : 'Unfurnished'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Balconies</span>
                <strong>{balcony !== undefined ? balcony : '1'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Floor Configuration</span>
                <strong>{floor !== undefined && total_floors !== undefined ? `${floor} of ${total_floors}` : '—'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Listing Status</span>
                <strong style={{ color: is_live ? 'var(--success)' : 'var(--warning)' }}>{is_live ? 'Active / Live' : 'Inactive'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Listing ID</span>
                <code style={{ color: 'var(--accent-primary)' }}>{listingId}</code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Posted Date</span>
                <span>{posted_at ? new Date(posted_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>About this Property</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
              {description || 'No seller description provided for this property.'}
            </p>
          </div>

        </div>

        {/* Right Column: Seller & Action Card */}
        <div>
          <div className="card glass-panel" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Contact Information
            </div>
            
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              {posted_by_name || 'Verified Property Partner'}
            </h4>
            
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize', marginBottom: '1.25rem' }}>
              Posted by: <strong style={{ color: 'var(--text-primary)' }}>{posted_by || 'Agent'}</strong>
            </div>

            {/* Contact details */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Direct Contact Number</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                <Phone size={18} />
                <span>{posted_by_contact || '+91 98000 00000'}</span>
              </div>
            </div>

            <a
              href={`tel:${posted_by_contact || ''}`}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '0.75rem' }}
            >
              <Phone size={16} />
              Call Seller
            </a>

            <button
              onClick={() => onToggleFavourite(listing)}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              <Heart size={16} fill={isFav ? '#ec4899' : 'none'} color={isFav ? '#ec4899' : 'currentColor'} />
              {isFav ? 'Saved in Favourites' : 'Add to Favourites'}
            </button>
          </div>
        </div>

      </div>

      {/* Similar Listings Carousel / Strip */}
      {similarListings.length > 0 && (
        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Similar Properties in <span className="gradient-text">{locality || 'the area'}</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Comparable listings with similar BHK configuration and pricing
          </p>

          <div className="property-grid">
            {similarListings.slice(0, 3).map(sim => (
              <PropertyCard
                key={sim.listing_id}
                listing={sim}
                isFavourite={favourites.some(f => (f.listing_id || f.id) === sim.listing_id)}
                onToggleFavourite={onToggleFavourite}
                onSelect={onSelectListing}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
