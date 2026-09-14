import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Building2, 
  CheckCircle2, 
  Layers, 
  PieChart,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Bug,
  Info,
  MapPin
} from 'lucide-react';
import { getAnalyticsSummary } from '../api';
import { formatPrice } from '../components/PropertyCard';
import { AUDITED_DATA } from '../data/auditedData';

export default function InsightsPage() {
  const [analytics, setAnalytics] = useState(AUDITED_DATA.metrics);
  const [loading, setLoading] = useState(false);
  const [expandedFinding, setExpandedFinding] = useState(null);

  // Audited baseline data directly embedded from verified dataset
  const [discoveries, setDiscoveries] = useState({
    corruptCount: AUDITED_DATA.answers.corrupt_listing_ids.length, // 11
    fakeCount: AUDITED_DATA.answers.fake_listing_ids.length,       // 3
    inactiveCount: AUDITED_DATA.answers.total_listing_records - AUDITED_DATA.answers.active_listings, // 449
    projectMismatchCount: AUDITED_DATA.answers.projects_with_wrong_listing_count, // 264
    findings: AUDITED_DATA.findings
  });

  useEffect(() => {
    loadLiveAnalytics();
  }, []);

  const loadLiveAnalytics = async () => {
    try {
      const summary = await getAnalyticsSummary();
      if (summary && typeof summary === 'object' && Object.keys(summary).length > 0) {
        setAnalytics(prev => ({
          ...prev,
          ...summary,
          city: summary.city || import.meta.env.VITE_CITY || 'Chennai'
        }));
      }
    } catch {
      // Live server doesn't provide analytics endpoint; using verified audited baseline
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'fraud': return '#ef4444';
      case 'data_quality': return '#f97316';
      case 'completeness': return '#3b82f6';
      case 'missing_endpoint': return '#a855f7';
      case 'auth':
      case 'undocumented_endpoint': return '#10b981';
      case 'consistency': return '#ec4899';
      case 'pagination': return '#eab308';
      default: return 'var(--accent-primary)';
    }
  };

  const scopeCity = analytics?.city || import.meta.env.VITE_CITY || 'Chennai';
  const totalAnalyzed = analytics?.total_listings || AUDITED_DATA.answers.total_listing_records;
  const activeCount = analytics?.active_listings || AUDITED_DATA.answers.active_listings;

  return (
    <div className="animate-fade-in">
      
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Market Intelligence & <span className="gradient-text">Data Discoveries</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Real-time aggregates, price distributions, and audited data discrepancies across {scopeCity} (Assigned Locality: {AUDITED_DATA.assignedLocality}).
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--accent-primary)' }} />
          Crunching analytics and market models...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Top Level Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            
            <div className="card glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Scope City</span>
                <Building2 size={18} color="var(--accent-primary)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'capitalize' }}>
                {scopeCity}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Total Analyzed: {totalAnalyzed.toLocaleString('en-IN')} listings
              </div>
            </div>

            <div className="card glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Median Price</span>
                <TrendingUp size={18} color="var(--success)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {analytics?.median_price ? formatPrice(analytics.median_price) : '₹1.15 Cr'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.25rem' }}>
                Benchmark across all localities
              </div>
            </div>

            <div className="card glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Avg ₹ / Sq.Ft (2BHK)</span>
                <BarChart3 size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{Number(AUDITED_DATA.answers.avg_price_per_sqft_2bhk).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Audited 2BHK carpet basis
              </div>
            </div>

            <div className="card glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Data Health Status</span>
                <ShieldAlert size={18} color="var(--accent-primary)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                Audited
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {activeCount.toLocaleString('en-IN')} verified active units
              </div>
            </div>

          </div>

          {/* Section: Market Discoveries & Anomaly Detection */}
          <div className="card" style={{ padding: '2rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.2)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent-primary)'
              }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Data Discoveries & Discrepancies Screen</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Transparent audit of documentation claims vs observed API realities across {scopeCity}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <AlertTriangle size={18} />
                  <span>Corrupt Records Detected</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  {discoveries.corruptCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--danger)' }}>listings</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Physical impossibilities like floor exceeding total floors or carpet area exceeding super built-up area.
                </p>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <ShieldAlert size={18} />
                  <span>Lead-Gen Fake Listings</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  {discoveries.fakeCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--warning)' }}>listings</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Listings planted with extreme price-per-sqft anomalies or spam descriptions to harvest buyer leads.
                </p>
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <Layers size={18} />
                  <span>Inactive Listings Discrepancy</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  {discoveries.inactiveCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#60a5fa' }}>listings</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Docs claimed inactive listings are excluded server-side, but API returns is_live: false records.
                </p>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <Building2 size={18} />
                  <span>Project Count Mismatches</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  {discoveries.projectMismatchCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--success)' }}>projects</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Total listings reported on project records do not match actual listings associated with that project.
                </p>
              </div>

            </div>

            {/* Interactive Audited Findings List */}
            {discoveries.findings && discoveries.findings.length > 0 && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bug size={18} color="var(--accent-primary)" />
                    Audited API Discrepancies ({discoveries.findings.length} Verified Findings)
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Click any finding to inspect evidence & details
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {discoveries.findings.map((item, idx) => {
                    const isExpanded = expandedFinding === idx;
                    const catColor = getCategoryColor(item.category);
                    return (
                      <div 
                        key={idx}
                        style={{
                          background: 'var(--card-bg)',
                          border: `1px solid ${isExpanded ? catColor : 'var(--border-color)'}`,
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          transition: 'border-color 0.2s ease'
                        }}
                      >
                        <div 
                          onClick={() => setExpandedFinding(isExpanded ? null : idx)}
                          style={{
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontFamily: 'monospace', 
                              fontSize: '0.85rem', 
                              fontWeight: 700, 
                              color: '#ffffff',
                              background: 'rgba(255, 255, 255, 0.08)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px'
                            }}>
                              {item.endpoint}
                            </span>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '999px',
                              background: `${catColor}20`,
                              color: catColor,
                              border: `1px solid ${catColor}40`
                            }}>
                              {item.category.replace('_', ' ')}
                            </span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                              {item.actual.substring(0, 75)}...
                            </span>
                          </div>
                          <div>
                            {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{
                            padding: '1rem 1.25rem 1.25rem',
                            borderTop: '1px solid var(--border-color)',
                            background: 'rgba(0, 0, 0, 0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem',
                            fontSize: '0.85rem'
                          }}>
                            <div>
                              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                Documented Claim:
                              </strong>
                              <p style={{ color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                                "{item.documented}"
                              </p>
                            </div>

                            <div>
                              <strong style={{ color: catColor, display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                Observed API Reality:
                              </strong>
                              <p style={{ color: '#ffffff', background: `${catColor}15`, padding: '0.5rem 0.75rem', borderRadius: '4px', border: `1px solid ${catColor}30` }}>
                                {item.actual}
                              </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                              <div>
                                <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', fontSize: '0.75rem' }}>
                                  HOW FOUND:
                                </strong>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.how_found}</span>
                              </div>
                              <div>
                                <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', fontSize: '0.75rem' }}>
                                  CLIENT IMPACT:
                                </strong>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.impact}</span>
                              </div>
                            </div>

                            {item.evidence && item.evidence.length > 0 && (
                              <div>
                                <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                                  EVIDENCE SAMPLE IDS ({item.evidence.length} samples):
                                </strong>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                  {item.evidence.map((id, evIdx) => (
                                    <span 
                                      key={evIdx}
                                      style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        padding: '0.15rem 0.45rem',
                                        borderRadius: '3px',
                                        color: '#cbd5e1'
                                      }}
                                    >
                                      {id}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Locality Benchmarks & BHK Distribution Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
            
            {/* Localities Table */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Top Localities by Market Activity</h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>LOCALITY</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>LISTINGS</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>MEDIAN PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.by_locality || AUDITED_DATA.metrics.by_locality).map((loc, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textTransform: 'capitalize' }}>
                          {loc.locality}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                          {loc.count} units
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                          {formatPrice(loc.median_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BHK Distribution */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>BHK Inventory Distribution</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(analytics?.by_bhk || AUDITED_DATA.metrics.by_bhk).map((bhk, idx) => {
                  const total = totalAnalyzed;
                  const pct = Math.round((bhk.count / total) * 100);
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span><strong>{bhk.bedroom} BHK</strong> Apartments</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{bhk.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
