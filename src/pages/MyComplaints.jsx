import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { ComplaintTable } from '../components/ComplaintTable';
import { SearchFilter, STATUS_FILTERS } from '../components/SearchFilter';
import { subscribeStudentComplaints } from '../services/complaintService';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';

/**
 * My Complaints page — powered by real-time Firestore listener with fallback.
 */
export default function MyComplaints({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [statusFilter, setFilter]   = useState('all');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeStudentComplaints(
      user,
      (list) => {
        setComplaints(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || 'Failed to load complaints from Firestore.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filtered = complaints.filter(c => {
    const matchSearch = search
      ? c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <PageHeader
        title="My Complaints"
        subtitle={`${complaints.length} complaint${complaints.length !== 1 ? 's' : ''} submitted`}
        actions={
          <Link to="/submit" className="btn btn-primary">
            + New Complaint
          </Link>
        }
      />

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: 'var(--text-sm)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <SearchFilter
          search={search}
          onSearch={setSearch}
          activeFilter={statusFilter}
          onFilter={setFilter}
          filters={STATUS_FILTERS}
          placeholder="Search by title, category or location…"
        />

        <div className="content-section">
          <div className="section-header">
            <p className="section-sub">
              Showing <strong>{filtered.length}</strong> of {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading ? (
            <div style={{
              padding: '48px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--color-text-secondary)',
            }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 'var(--text-sm)' }}>Loading complaints…</p>
            </div>
          ) : (
            <ComplaintTable
              complaints={filtered}
              showActions={false}
              emptyTitle={complaints.length === 0 ? "You haven't submitted any complaints yet" : "No complaints match your filters"}
              emptyMessage={complaints.length === 0 ? "Use the '+ New Complaint' button above to submit your first campus issue." : "Try adjusting your search term or selecting a different status."}
            />
          )}
        </div>
      </div>
    </>
  );
}
