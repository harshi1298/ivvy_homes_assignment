import React from 'react';
import { Building, MapPin, Calendar, Layers, ShieldCheck } from 'lucide-react';
import { formatPrice } from './PropertyCard';

export default function ProjectCard({ project }) {
  const {
    project_id,
    apartment_name,
    developer_name,
    locality,
    project_status,
    total_units,
    total_listings,
    min_area_sqft,
    max_area_sqft,
    price_min,
    price_max,
    amenities,
    rera_number,
    possession_date
  } = project;

  const statusColors = {
    'ready to move': 'var(--success)',
    'under construction': 'var(--warning)',
    'new launch': 'var(--accent-primary)'
  };

  const statusColor = statusColors[(project_status || '').toLowerCase()] || 'var(--text-secondary)';

  return (
    <div className="card">
      <div style={{
        padding: '1.25rem',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
            {developer_name || 'Builder Project'}
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {apartment_name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem', textTransform: 'capitalize' }}>
            <MapPin size={13} color="var(--accent-primary)" />
            <span>{locality || 'Bangalore'}</span>
          </div>
        </div>

        <span className="badge" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          color: statusColor,
          border: `1px solid ${statusColor}40`,
          textTransform: 'capitalize'
        }}>
          {project_status || 'Ongoing'}
        </span>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        {/* Price & Area Range */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PRICE RANGE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              {price_min ? formatPrice(price_min) : '—'} - {price_max ? formatPrice(price_max) : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UNIT SIZES</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {min_area_sqft || '—'} - {max_area_sqft || '—'} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>sq.ft</span>
            </div>
          </div>
        </div>

        {/* Units and Listings */}
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
          <div>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Total Units</span>
            <strong>{total_units || '—'}</strong>
          </div>
          <div>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Listings Available</span>
            <strong style={{ color: 'var(--accent-primary)' }}>{total_listings || 0}</strong>
          </div>
          <div>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Possession</span>
            <strong>{possession_date ? possession_date.slice(0, 7) : 'Ready'}</strong>
          </div>
        </div>

        {/* Amenities */}
        {amenities && Array.isArray(amenities) && amenities.length > 0 && (
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Amenities</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {amenities.slice(0, 4).map((a, i) => (
                <span key={i} className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                  {a}
                </span>
              ))}
              {amenities.length > 4 && (
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                  +{amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer with RERA and Project ID */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
          {rera_number ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={13} color="var(--success)" />
              RERA: {rera_number}
            </span>
          ) : (
            <span>ID: {project_id}</span>
          )}
          <span style={{ fontFamily: 'monospace', opacity: 0.7 }}>{project_id}</span>
        </div>
      </div>
    </div>
  );
}
