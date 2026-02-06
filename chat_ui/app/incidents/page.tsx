'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './incidents.css';

type Incident = {
  id: string;
  ts: number;
  summary: string;
  description: string;
  source: string;
  trace_id?: string | null;
  user_message: string;
  status: "open" | "applied" | "skipped" | "failed";
  last_action?: string | null;
  error?: string | null;
};

const statusConfig = {
  open: { label: 'Open', color: '#f59e0b', icon: '🔴' },
  applied: { label: 'Resolved', color: '#10b981', icon: '✅' },
  skipped: { label: 'Skipped', color: '#6b7280', icon: '⏭️' },
  failed: { label: 'Failed', color: '#ef4444', icon: '❌' },
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchIncidents() {
      try {
        const res = await fetch('/api/incidents', { cache: 'no-store' });
        const data = await res.json();
        setIncidents(data.incidents || []);
      } catch (error) {
        console.error('Failed to fetch incidents:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchIncidents();
  }, []);

  const filteredIncidents = incidents.filter((incident) => {
    const matchesFilter = filter === 'all' || incident.status === filter;
    const matchesSearch =
      incident.summary.toLowerCase().includes(search.toLowerCase()) ||
      incident.id.toLowerCase().includes(search.toLowerCase()) ||
      incident.source.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    applied: incidents.filter(i => i.status === 'applied').length,
    failed: incidents.filter(i => i.status === 'failed').length,
  };

  return (
    <div className="incidents-page">
      <div className="incidents-container">
        {/* Header */}
        <div className="incidents-header">
          <div className="incidents-title-section">
            <div className="incidents-icon">🚨</div>
            <div>
              <h1 className="incidents-title">Incident Management</h1>
              <p className="incidents-subtitle">
                Track and resolve AI governance incidents in real-time
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="incidents-stats">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Incidents</div>
            </div>
            <div className="stat-card stat-warning">
              <div className="stat-value">{stats.open}</div>
              <div className="stat-label">Open</div>
            </div>
            <div className="stat-card stat-success">
              <div className="stat-value">{stats.applied}</div>
              <div className="stat-label">Resolved</div>
            </div>
            <div className="stat-card stat-error">
              <div className="stat-value">{stats.failed}</div>
              <div className="stat-label">Failed</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="incidents-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search incidents by ID, summary, or source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({incidents.length})
            </button>
            <button
              className={`filter-tab ${filter === 'open' ? 'active' : ''}`}
              onClick={() => setFilter('open')}
            >
              Open ({stats.open})
            </button>
            <button
              className={`filter-tab ${filter === 'applied' ? 'active' : ''}`}
              onClick={() => setFilter('applied')}
            >
              Resolved ({stats.applied})
            </button>
            <button
              className={`filter-tab ${filter === 'failed' ? 'active' : ''}`}
              onClick={() => setFilter('failed')}
            >
              Failed ({stats.failed})
            </button>
          </div>
        </div>

        {/* Incidents List */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading incidents...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {search || filter !== 'all' ? '🔍' : '✅'}
            </div>
            <h2 className="empty-state-title">
              {search || filter !== 'all'
                ? 'No incidents match your filters'
                : 'No incidents found'}
            </h2>
            <p className="empty-state-text">
              {search || filter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'All systems are operating normally. Dragon is monitoring your AI governance.'}
            </p>
            {(search || filter !== 'all') && (
              <button
                className="reset-filters-btn"
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="incidents-timeline">
            <div className="timeline-line"></div>
            {filteredIncidents.map((incident, index) => {
              const config = statusConfig[incident.status];
              const incidentDate = new Date(incident.ts);
              const timeAgo = getTimeAgo(incident.ts);

              return (
                <Link
                  key={incident.id}
                  href={`/incidents/${incident.id}`}
                  className="incident-card"
                >
                  <div className="incident-timeline-dot" style={{ backgroundColor: config.color }}></div>

                  <div className="incident-card-header">
                    <div className="incident-card-top">
                      <div className="incident-summary">
                        <span className="incident-icon">{config.icon}</span>
                        <h3>{incident.summary}</h3>
                      </div>
                      <span
                        className={`status-badge status-${incident.status}`}
                        style={{ borderColor: config.color, color: config.color }}
                      >
                        {config.label}
                      </span>
                    </div>

                    <div className="incident-meta">
                      <div className="incident-meta-item">
                        <span className="meta-label">ID:</span>
                        <span className="meta-value">{incident.id}</span>
                      </div>
                      <div className="incident-meta-item">
                        <span className="meta-label">Source:</span>
                        <span className="meta-value">{incident.source}</span>
                      </div>
                      <div className="incident-meta-item">
                        <span className="meta-label">Time:</span>
                        <span className="meta-value">{timeAgo}</span>
                      </div>
                      {incident.trace_id && (
                        <div className="incident-meta-item">
                          <span className="meta-label">Trace:</span>
                          <span className="meta-value trace-id">{incident.trace_id}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {incident.user_message && (
                    <div className="incident-user-message">
                      <strong>User Message:</strong> {incident.user_message}
                    </div>
                  )}

                  {incident.status === 'failed' && incident.error && (
                    <div className="incident-error">
                      <span className="error-icon">⚠️</span>
                      <div>
                        <strong>Error:</strong>
                        <p>{incident.error}</p>
                      </div>
                    </div>
                  )}

                  {incident.last_action && (
                    <div className="incident-last-action">
                      Last action: {incident.last_action}
                    </div>
                  )}

                  <div className="incident-card-footer">
                    <span className="view-details">View Details →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
