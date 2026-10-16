import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, Clock, CheckCircle2, TrendingUp, PlusSquare, Loader2, AlertCircle
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { ComplaintTable } from '../components/ComplaintTable';
import { SearchFilter, STATUS_FILTERS } from '../components/SearchFilter';
import { subscribeStudentComplaints } from '../services/complaintService';
import { getStats } from '../utils/storage';

/**
 * Student Dashboard — dynamically powered by real-time Firestore complaints with fallback.
 */
export default function StudentDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search,     setSearch]     = useState('');
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
        setError(err.message || 'Failed to fetch complaints.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const stats = getStats(complaints);

  const filtered = complaints.filter(c => {
    const matchSearch = search
      ? c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  return (
    <>
      <PageHeader
        title={`Hello, ${firstName} 👋`}
        subtitle={`${user?.department || 'Student'}${user?.rollNumber ? ` • ${user.rollNumber}` : ''}`}
        actions={
          <Link to="/submit" className="btn btn-primary">
            <PlusSquare size={15} /> New Complaint
          </Link>
        }
      />

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
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

        {/* Stat cards */}
        <div className="stat-grid">
          <StatCard
            label="Total Submitted"
            value={stats.total}
            icon={<ClipboardList size={20} />}
            iconBg="var(--color-mint)"
            iconColor="var(--color-primary)"
            change="All time"
            changeType="neu"
            accent
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Clock size={20} />}
            iconBg="var(--color-warning-bg)"
            iconColor="var(--color-warning)"
            change={stats.pending > 0 ? "Awaiting review" : "None pending"}
            changeType="neu"
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={<TrendingUp size={20} />}
            iconBg="var(--color-progress-bg)"
            iconColor="var(--color-progress)"
            change="Being addressed"
            changeType="up"
          />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            icon={<CheckCircle2 size={20} />}
            iconBg="var(--color-success-bg)"
            iconColor="var(--color-success)"
            change="Completed"
            changeType="up"
          />
        </div>

        {/* Recent complaints table */}
        <div className="content-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">My Recent Complaints</h2>
              <p className="section-sub">Your submitted complaints and their current resolution status</p>
            </div>
            <Link to="/my-complaints" className="btn btn-secondary btn-sm">
              View all
            </Link>
          </div>

          <SearchFilter
            search={search}
            onSearch={setSearch}
            activeFilter={statusFilter}
            onFilter={setFilter}
            filters={STATUS_FILTERS}
          />

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
              complaints={filtered.slice(0, 5)}
              showActions={false}
              emptyTitle={complaints.length === 0 ? "No complaints submitted yet" : "No matching complaints"}
              emptyMessage={complaints.length === 0 ? "Click '+ New Complaint' to submit your first issue." : "Try clearing your search or changing the status filter."}
            />
          )}
        </div>
      </div>
    </>
  );
}
