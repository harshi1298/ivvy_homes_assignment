import React from 'react';
import { Bed, Bath, Square, MapPin, CheckCircle2, Heart, AlertTriangle } from 'lucide-react';

export function formatPrice(price) {
  if (!price || isNaN(price)) return 'Price on Request';
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

export default function PropertyCard({ listing, isFavourite, onToggleFavourite, onSelect }) {
  const {
    listing_id,
    apartment_name,
    locality,
    property_type,
    bedroom,
    bathroom,
    carpet_area,
    super_built_up_area,
    floor,
    total_floors,
    furnishing,
    price,
    is_verified,
    is_live
  } = listing;

  const pricePerSqft = (price && carpet_area && carpet_area > 0)
    ? Math.round(price / carpet_area)
    : null;

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={() => onSelect(listing_id)}>
      
      {/* Visual Header / Cover banner */}
      <div style={{
        height: '140px',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1rem'
      }}>
        {/* Badges Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {is_verified && (
              <span className="badge badge-verified">
                <CheckCircle2 size={12} />
                Verified
              </span>
            )}
            {is_live === false && (
              <span className="badge badge-warning">
                <AlertTriangle size={12} />
                Inactive
              </span>
            )}
            <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
              {property_type || 'Apartment'}
            </span>
          </div>

          {/* Favourite Heart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavourite(listing);
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(8px)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title={isFavourite ? "Remove from favourites" : "Save to favourites"}
          >
            <Heart
              size={18}
              fill={isFavourite ? '#ec4899' : 'none'}
              color={isFavourite ? '#ec4899' : '#ffffff'}
            />
          </button>
        </div>

        {/* Price & Price/Sqft */}
        <div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
            {formatPrice(price)}
          </div>
          {pricePerSqft && (
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              ₹{pricePerSqft.toLocaleString('en-IN')}/sq.ft
            </div>
          )}
        </div>
      </div>

      {/* Body Information */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {apartment_name || `${bedroom || ''} BHK in ${locality || 'Property'}`}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
            <MapPin size={14} color="var(--accent-primary)" />
            <span>{locality || 'Bangalore'}</span>
            {floor !== undefined && total_floors !== undefined && (
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Floor {floor}/{total_floors}
              </span>
            )}
          </div>
        </div>

        {/* Specs Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          padding: '0.65rem 0',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Bed size={15} color="var(--accent-primary)" />
            <span>{bedroom ? `${bedroom} BHK` : '—'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Bath size={15} color="var(--accent-primary)" />
            <span>{bathroom ? `${bathroom} Bath` : '—'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Square size={15} color="var(--accent-primary)" />
            <span>{carpet_area ? `${carpet_area} sqft` : '—'}</span>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ textTransform: 'capitalize' }}>
            {furnishing ? furnishing.replace('-', ' ') : 'Unfurnished'}
          </span>
          <span style={{ fontFamily: 'monospace', opacity: 0.7 }}>
            ID: {listing_id}
          </span>
        </div>
      </div>

    </div>
  );
}
