import React from 'react';
import { Heart, Trash2, ArrowRight, Building2 } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { useAuth } from '../context/AuthContext';

export default function FavouritesPage({ favourites, onToggleFavourite, onSelectListing, onBrowseListings }) {
  const { user, isAuthenticated, setIsAuthModalOpen } = useAuth();

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Your Saved <span className="gradient-text">Properties</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {isAuthenticated 
            ? `Personalized watchlist for ${user?.email || 'your account'} (persisted across sessions)`
            : 'Saved in your local session. Sign in with a demo account to sync across devices.'}
        </p>

        {!isAuthenticated && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>
              Want your favourites saved to your server profile? Sign in with one of your demo accounts.
            </span>
            <button onClick={() => setIsAuthModalOpen(true)} className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
              Sign In
            </button>
          </div>
        )}
      </div>

      {favourites.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '500px', margin: '3rem auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(236, 72, 153, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#ec4899'
          }}>
            <Heart size={32} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No saved properties yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Click the heart icon on any listing to bookmark it and compare it later.
          </p>

          <button onClick={onBrowseListings} className="btn btn-primary" style={{ margin: '0 auto' }}>
            <Building2 size={16} />
            Explore Properties
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Saved <strong>{favourites.length}</strong> {favourites.length === 1 ? 'property' : 'properties'}
            </span>
          </div>

          <div className="property-grid">
            {favourites.map(listing => (
              <PropertyCard
                key={listing.listing_id || listing.id}
                listing={listing}
                isFavourite={true}
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
