import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Home, 
  Key, 
  Heart, 
  BarChart3, 
  LogIn, 
  LogOut, 
  Clock, 
  ShieldCheck,
  Building
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, favouritesCount = 0 }) {
  const { user, isAuthenticated, logout, setIsAuthModalOpen, elapsedMinutes } = useAuth();

  return (
    <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        
        {/* Brand */}
        <div 
          onClick={() => {
            if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
            setActiveTab('listings');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            background: 'var(--accent-gradient)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--accent-glow)'
          }}>
            <Building2 size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Ivy<span className="gradient-text">Homes</span>
            </span>
            <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verified Property Portal
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => {
              if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
              setActiveTab('listings');
            }}
            className={`btn ${activeTab === 'listings' && isAuthenticated ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <Home size={16} />
            Buy Listings
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
              setActiveTab('rentals');
            }}
            className={`btn ${activeTab === 'rentals' && isAuthenticated ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <Key size={16} />
            Rentals
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
              setActiveTab('projects');
            }}
            className={`btn ${activeTab === 'projects' && isAuthenticated ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <Building size={16} />
            Projects
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
              setActiveTab('insights');
            }}
            className={`btn ${activeTab === 'insights' && isAuthenticated ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <BarChart3 size={16} />
            Market Insights
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
              setActiveTab('favourites');
            }}
            className={`btn ${activeTab === 'favourites' && isAuthenticated ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.85rem', position: 'relative' }}
          >
            <Heart size={16} fill={favouritesCount > 0 ? '#ec4899' : 'none'} color={favouritesCount > 0 ? '#ec4899' : 'currentColor'} />
            Saved
            {favouritesCount > 0 && (
              <span style={{
                background: '#ec4899',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                marginLeft: '0.2rem'
              }}>
                {favouritesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Auth / Profile Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  {user?.email ? user.email[0].toUpperCase() : 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.email}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={11} />
                    Active {elapsedMinutes}m (Session valid)
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
