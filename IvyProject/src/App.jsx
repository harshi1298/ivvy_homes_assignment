import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import RentalsPage from './pages/RentalsPage';
import ProjectsPage from './pages/ProjectsPage';
import FavouritesPage from './pages/FavouritesPage';
import InsightsPage from './pages/InsightsPage';
import { getFavourites, saveFavourite, removeFavourite } from './api';

function MainApp() {
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [favourites, setFavourites] = useState([]);

  // URL routing synchronization (supports URL like #/listings/100-1000042 or path /listings/:id)
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (hash.startsWith('#/listings/')) {
        const id = hash.replace('#/listings/', '');
        setSelectedListingId(id);
        setActiveTab('listing_detail');
      } else if (hash.startsWith('#/rentals')) {
        setActiveTab('rentals');
        setSelectedListingId(null);
      } else if (hash.startsWith('#/projects')) {
        setActiveTab('projects');
        setSelectedListingId(null);
      } else if (hash.startsWith('#/insights')) {
        setActiveTab('insights');
        setSelectedListingId(null);
      } else if (hash.startsWith('#/favourites')) {
        setActiveTab('favourites');
        setSelectedListingId(null);
      } else if (path.includes('/listings/') && path.split('/listings/')[1]) {
        const id = path.split('/listings/')[1];
        setSelectedListingId(id);
        setActiveTab('listing_detail');
      } else {
        setSelectedListingId(null);
      }
    };

    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Sync activeTab to URL hash for browser history
  const navigateToTab = (tab) => {
    setActiveTab(tab);
    setSelectedListingId(null);
    window.location.hash = `#/${tab}`;
  };

  const navigateToListing = (id) => {
    setSelectedListingId(id);
    setActiveTab('listing_detail');
    window.location.hash = `#/listings/${id}`;
  };

  // Load user favourites on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadUserFavourites();
    } else {
      setFavourites([]);
    }
  }, [isAuthenticated]);

  const loadUserFavourites = async () => {
    try {
      const favs = await getFavourites();
      setFavourites(favs);
    } catch (e) {
      console.warn('Could not load user favourites:', e);
    }
  };

  const handleToggleFavourite = async (listing) => {
    const id = listing.listing_id || listing.id;
    const exists = favourites.some(f => (f.listing_id || f.id) === id);

    if (exists) {
      const updated = await removeFavourite(id);
      setFavourites(updated);
    } else {
      const updated = await saveFavourite(listing);
      setFavourites(updated);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab === 'listing_detail' ? 'listings' : activeTab}
        setActiveTab={navigateToTab}
        favouritesCount={favourites.length}
      />

      <main className="main-content">
        {!isAuthenticated ? (
          <div className="card glass-panel" style={{
            maxWidth: '560px',
            margin: '4rem auto',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'var(--accent-primary)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Sign In to View Properties
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              All property listings, rentals, builder projects, and saved homes are protected and strictly accessible to authenticated users only.
            </p>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1rem', width: '100%' }}
            >
              Sign In to Access Portal
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'listings' && (
              <ListingsPage
                onSelectListing={navigateToListing}
                favourites={favourites}
                onToggleFavourite={handleToggleFavourite}
              />
            )}

            {activeTab === 'listing_detail' && (
              <ListingDetailPage
                listingId={selectedListingId}
                onBack={() => navigateToTab('listings')}
                onSelectListing={navigateToListing}
                favourites={favourites}
                onToggleFavourite={handleToggleFavourite}
              />
            )}

            {activeTab === 'rentals' && <RentalsPage />}

            {activeTab === 'projects' && <ProjectsPage />}

            {activeTab === 'favourites' && (
              <FavouritesPage
                favourites={favourites}
                onToggleFavourite={handleToggleFavourite}
                onSelectListing={navigateToListing}
                onBrowseListings={() => navigateToTab('listings')}
              />
            )}

            {activeTab === 'insights' && <InsightsPage />}
          </>
        )}
      </main>

      <AuthModal />

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2rem 1.5rem', marginTop: 'auto', background: 'var(--bg-secondary)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            Ivy Homes Property Intelligence Platform • Built for Software Engineering Internship 2026
          </div>
          <div>
            API: <code style={{ color: 'var(--accent-primary)' }}>solve.ivy.homes</code> • Powered by Vite + React
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
