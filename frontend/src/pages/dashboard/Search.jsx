import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import PortalCard from '../../components/dashboard/PortalCard';
import { caseService } from '../../services';
import { useApi } from '../../hooks/useApi';
import { getImageUrl } from '../../utils/image';

function Search() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const { data, loading, execute: searchCases } = useApi(caseService.search);

  // Trigger search automatically if 'q' URL parameter changes or is set on mount
  useEffect(() => {
    if (urlQuery.trim()) {
      setQuery(urlQuery.trim());
      setHasSearched(true);
      searchCases(urlQuery.trim());
    }
  }, [urlQuery]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setHasSearched(true);
    searchCases(query.trim());
  };

  const results = data?.results || [];

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="portal-main-container dashboard-main-container">
        
        {/* Header Section */}
        <header className="portal-header-bar dashboard-header-bar" style={{ marginBottom: '32px' }}>
          <div>
            <h1 className="portal-welcome-title dashboard-welcome-title">Search Telemetry Database</h1>
            <p className="portal-welcome-sub dashboard-welcome-sub">
              Query indices, search geographical locations, descriptive profiles, or case IDs.
            </p>
          </div>
        </header>

        {/* Google Style Search Bar */}
        <div style={{ maxWidth: '680px', margin: '0 auto 40px auto' }}>
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--card-bg)',
            padding: '6px 14px',
            borderRadius: '28px',
            boxShadow: 'var(--box-shadow)',
            border: '1px solid var(--border-color)',
            transition: 'border-color 0.15s, box-shadow 0.15s'
          }}>
            <span className="material-symbols-rounded" style={{ color: 'var(--text-light)', marginRight: '8px' }}>search</span>
            <input 
              type="text" 
              placeholder="Search by name, area, or descriptive tags..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              style={{
                flex: 1,
                padding: '8px 4px',
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                color: 'var(--text-color)',
                backgroundColor: 'transparent'
              }}
            />
            <button 
              type="submit" 
              className="portal-modal-btn-primary portal-btn-primary" 
              style={{ borderRadius: '20px', height: '34px', fontSize: '13px', padding: '0 20px', border: 'none', cursor: 'pointer' }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Results view */}
        {loading ? (
          <div className="portal-scan-wrapper" style={{ minHeight: '200px' }}>
            <div className="portal-pulse-scanner" style={{ animation: 'spin 1s linear infinite', borderTopColor: 'transparent' }}></div>
            <p style={{ marginTop: '16px', color: 'var(--text-light)' }}>Querying database registries...</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="portal-empty-state" style={{ padding: '60px 24px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <span className="material-symbols-rounded portal-empty-icon" style={{ fontSize: '48px' }}>search_off</span>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--text-color)' }}>No Case Files Found</h4>
            <p className="portal-empty-text" style={{ maxWidth: '300px', margin: '0 auto' }}>
              We couldn't find matching telemetry details for "{query}".
            </p>
          </div>
        ) : (
          <div className="portal-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px' }}>
            {results.map(person => (
              <PortalCard 
                key={person.id} 
                title={person.name} 
                hoverable 
                onClick={() => navigate(`/case/${person.id}`)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {person.ai_match_score && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: 'rgba(249, 171, 0, 0.08)',
                      border: '1px solid rgba(249, 171, 0, 0.25)',
                      color: 'var(--warning-color)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      alignSelf: 'flex-start',
                      marginBottom: '-4px'
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '13px' }}>auto_awesome</span>
                      AI Semantic Match: {person.ai_match_score}%
                    </div>
                  )}

                  {/* Photo Section */}
                  <div style={{
                    height: '140px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--light-color)'
                  }}>
                    {person.image ? (
                      <img 
                        src={getImageUrl(person.image)} 
                        alt={person.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '32px', color: 'var(--text-light)' }}>portrait</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>No Portrait Available</span>
                      </div>
                    )}
                  </div>

                  {/* Meta details */}
                  <div className="portal-modal-details-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Age / Gender</span>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-color)' }}>{person.age} yrs • {person.gender}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Last Seen</span>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-color)' }}>{person.area}</span>
                    </div>
                  </div>

                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: 'var(--text-light)',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {person.description}
                  </p>

                  {person.ai_match_reason && (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--light-color)',
                      borderLeft: '3px solid var(--warning-color)',
                      fontSize: '11px',
                      color: 'var(--text-light)',
                      lineHeight: '1.4',
                      fontStyle: 'italic',
                      marginTop: '4px'
                    }}>
                      {person.ai_match_reason}
                    </div>
                  )}

                </div>
              </PortalCard>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Search;
