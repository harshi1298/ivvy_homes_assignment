import React from 'react';
import { Bed, Bath, Square, MapPin, Key, Shield } from 'lucide-react';
import { formatPrice } from './PropertyCard';

export default function RentalCard({ rental }) {
  const {
    listing_id,
    title,
    apartment_name,
    locality,
    property_type,
    bedroom,
    bathroom,
    carpet_area,
    floor,
    total_floors,
    furnishing,
    price,
    deposit,
    maintenance
  } = rental;

  return (
    <div className="card">
      <div style={{
        height: '110px',
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #1e293b 100%)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Key size={12} />
            For Rent
          </span>
          <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
            {property_type || 'Apartment'}
          </span>
        </div>

        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
            {price ? `₹${Number(price).toLocaleString('en-IN')}` : '₹—'}<span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#a7f3d0' }}>/month</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title || apartment_name || `${bedroom || ''} BHK for rent`}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
            <MapPin size={13} color="var(--success)" />
            <span>{locality || import.meta.env.VITE_CITY || 'Chennai'}</span>
            {floor !== undefined && (
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Floor {floor}/{total_floors || '?'}
              </span>
            )}
          </div>
        </div>

        {/* Specs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          padding: '0.5rem 0',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Bed size={14} color="var(--success)" />
            <span>{bedroom ? `${bedroom} BHK` : '—'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Bath size={14} color="var(--success)" />
            <span>{bathroom ? `${bathroom} Bath` : '—'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Square size={14} color="var(--success)" />
            <span>{carpet_area ? `${carpet_area} sqft` : '—'}</span>
          </div>
        </div>

        {/* Deposit & Maintenance */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Deposit: <strong style={{ color: 'var(--text-primary)' }}>{deposit ? formatPrice(deposit) : '—'}</strong></span>
          {maintenance && <span>Maint: <strong style={{ color: 'var(--text-primary)' }}>₹{Number(maintenance).toLocaleString('en-IN')}</strong></span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ textTransform: 'capitalize' }}>
            {furnishing ? furnishing.replace('-', ' ') : 'Semi-furnished'}
          </span>
          <span style={{ fontFamily: 'monospace', opacity: 0.7 }}>
            {listing_id}
          </span>
        </div>
      </div>
    </div>
  );
}
