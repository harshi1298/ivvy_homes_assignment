import React, { useState, useEffect } from 'react';
import { Building, RefreshCw, AlertCircle } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import { getProjects } from '../api';

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
  'koramangala',
  'whitefield',
  'indiranagar',
  'sarjapur road'
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pure API Query Filters
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [customLocality, setCustomLocality] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('launch_date');

  // Limit: default 20, max 100
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const activeLocality = customLocality.trim() || (selectedLocality !== 'all' ? selectedLocality : '');

  // Re-query API whenever any filter, limit, or page changes
  useEffect(() => {
    fetchProjects();
  }, [selectedLocality, customLocality, selectedStatus, sortBy, limit, currentPage]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const enforcedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const params = {
        page: currentPage,
        limit: enforcedLimit
      };

      if (activeLocality) {
        params.locality = activeLocality.toLowerCase().trim();
      }

      if (selectedStatus !== 'all') {
        params.project_status = selectedStatus.toLowerCase().trim();
      }

      if (sortBy === 'price_min_asc') {
        params.sort_by = 'price_min';
        params.order = 'asc';
      } else if (sortBy === 'price_max_desc') {
        params.sort_by = 'price_max';
        params.order = 'desc';
      } else if (sortBy === 'units_desc') {
        params.sort_by = 'total_units';
        params.order = 'desc';
      } else {
        params.sort_by = 'launch_date';
        params.order = 'desc';
      }

      const res = await getProjects(params);
      setProjects(res.results || []);
      setTotalCount(res.total !== undefined ? res.total : (res.results?.length || 0));
    } catch (err) {
      console.error('Projects API error:', err);
      setError(err.message || 'Error fetching projects from server');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const enforcedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const totalPages = Math.ceil(totalCount / enforcedLimit) || 1;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Builder <span className="gradient-text">Residential Projects</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Real-time query-driven builder township projects and upcoming launches.
        </p>

        {/* Filter bar */}
        <div className="card glass-panel" style={{ marginTop: '1.5rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'center' }}>
            <div>
              <input
                type="text"
                placeholder="Type locality (e.g. sarjapur road, omr)..."
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
              <option value="launch_date">Newest Launch</option>
              <option value="price_min_asc">Starting Price: Low to High</option>
              <option value="price_max_desc">Max Price: High to Low</option>
              <option value="units_desc">Most Units</option>
            </select>

            <button
              onClick={fetchProjects}
              className="btn btn-secondary"
              title="Refresh projects"
              style={{ padding: '0.65rem' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
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

            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Project Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', textTransform: 'capitalize' }}
              >
                <option value="all">All Statuses</option>
                <option value="ready to move">Ready to Move</option>
                <option value="under construction">Under Construction</option>
                <option value="new launch">New Launch</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Page Limit
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

      {/* Results Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          API Results: <strong>{projects.length}</strong> builder projects returned (Page {currentPage} of {totalPages}, Total: {totalCount})
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Query Limit: <code>limit={enforcedLimit}</code> (Default 20, Max 100)
        </div>
      </div>

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
            <strong>Projects API Error:</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--accent-primary)' }} />
          Querying backend API for builder projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Building size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No projects found matching your query</h3>
          <p style={{ fontSize: '0.9rem' }}>Try changing your status or locality filters.</p>
        </div>
      ) : (
        <div className="property-grid">
          {projects.map(project => (
            <ProjectCard key={project.project_id} project={project} />
          ))}
        </div>
      )}

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
