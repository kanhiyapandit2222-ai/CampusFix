import { useState, useEffect } from 'react';
import {
  ClipboardList, Clock, CheckCircle2, XCircle, TrendingUp,
  Download, Loader2, AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { ComplaintTable } from '../components/ComplaintTable';
import { SearchFilter, STATUS_FILTERS } from '../components/SearchFilter';
import { CATEGORIES } from '../data/demoData';
import { StatusBadge } from '../components/StatusBadge';
import { subscribeAllComplaints, updateStatus } from '../services/complaintService';
import { getStats } from '../utils/storage';
import { isFirebaseConfigured } from '../lib/firebase';

/**
 * Admin Dashboard — powered by Cloud Firestore with real-time status updates.
 */
export default function AdminDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [statusFilter, setFilter]   = useState('all');
  const [categoryFilter, setCategory] = useState('all');
  const [selectedComplaint, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAllComplaints(
      (list) => {
        setComplaints(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || 'Failed to fetch complaints from Firestore.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* Live stats derived from real-time snapshot */
  const liveStats = getStats(complaints);

  const filtered = complaints.filter(c => {
    const matchSearch = search
      ? c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.submittedBy && c.submittedBy.toLowerCase().includes(search.toLowerCase())) ||
        (c.studentName && c.studentName.toLowerCase().includes(search.toLowerCase())) ||
        c.location.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus   = statusFilter === 'all'   || c.status   === statusFilter;
    const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  /* Change status via Firestore */
  const handleStatusChange = async (complaint, newStatus) => {
    const res = await updateStatus(complaint.id, newStatus);
    if (!res.success) {
      alert(res.error || 'Failed to update status.');
      return;
    }
    if (selectedComplaint && selectedComplaint.id === complaint.id) {
      setSelected(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Manage and resolve campus complaints • ${user?.department || 'Facility Management'}`}
        actions={
          <button className="btn btn-secondary" disabled title="Export not available in Phase 1/2">
            <Download size={14} /> Export CSV
          </button>
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
            label="Total Complaints"
            value={liveStats.total}
            icon={<ClipboardList size={20} />}
            iconBg="var(--color-mint)"
            iconColor="var(--color-primary)"
            accent
          />
          <StatCard
            label="Pending Review"
            value={liveStats.pending}
            icon={<Clock size={20} />}
            iconBg="var(--color-warning-bg)"
            iconColor="var(--color-warning)"
            change={liveStats.pending > 0 ? `${liveStats.pending} need attention` : 'All clear'}
            changeType={liveStats.pending > 0 ? 'down' : 'up'}
          />
          <StatCard
            label="In Progress"
            value={liveStats.inProgress}
            icon={<TrendingUp size={20} />}
            iconBg="var(--color-progress-bg)"
            iconColor="var(--color-progress)"
            change="Being addressed"
            changeType="neu"
          />
          <StatCard
            label="Resolved"
            value={liveStats.resolved}
            icon={<CheckCircle2 size={20} />}
            iconBg="var(--color-success-bg)"
            iconColor="var(--color-success)"
            change={`${liveStats.total > 0 ? Math.round((liveStats.resolved / liveStats.total) * 100) : 0}% resolution rate`}
            changeType="up"
          />
          <StatCard
            label="Rejected"
            value={liveStats.rejected}
            icon={<XCircle size={20} />}
            iconBg="var(--color-danger-bg)"
            iconColor="var(--color-danger)"
          />
        </div>

        {/* Quick category breakdown */}
        <div className="card card-padded">
          <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
            Complaints by Category
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {CATEGORIES.map(cat => {
              const count = complaints.filter(c => c.category === cat.value).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.value}
                  className={`filter-chip${categoryFilter === cat.value ? ' active' : ''}`}
                  onClick={() => setCategory(prev => prev === cat.value ? 'all' : cat.value)}
                >
                  {cat.label} <strong style={{ marginLeft: 4 }}>{count}</strong>
                </button>
              );
            })}
          </div>
        </div>

        {/* Complaints management table */}
        <div className="content-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">All Complaints</h2>
              <p className="section-sub">
                Showing {filtered.length} of {complaints.length} complaints
              </p>
            </div>
          </div>

          <SearchFilter
            search={search}
            onSearch={setSearch}
            activeFilter={statusFilter}
            onFilter={setFilter}
            filters={STATUS_FILTERS}
            placeholder="Search by title, student or location…"
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
              complaints={filtered}
              showActions={true}
              onView={setSelected}
              onStatusChange={handleStatusChange}
              emptyTitle="No complaints found"
              emptyMessage="Adjust your search or filters to see results."
            />
          )}
        </div>

        {/* Detail drawer (inline panel) */}
        {selectedComplaint && (
          <ComplaintDetailPanel
            complaint={selectedComplaint}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </>
  );
}

/* ── Inline complaint detail panel ──────────────────────── */
function ComplaintDetailPanel({ complaint, onClose, onStatusChange }) {
  return (
    <div
      style={{
        position: 'fixed', top: 0, right: 0, width: 420, height: '100vh',
        background: 'var(--color-bg-card)', borderLeft: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)', zIndex: 300, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        padding: 'var(--space-5)', borderBottom: '1px solid var(--color-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
      }}>
        <div>
          <span className="complaint-id">{complaint.id}</span>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginTop: 6, fontSize: 'var(--text-md)' }}>
            {complaint.title}
          </h3>
        </div>
        <button className="btn btn-secondary btn-sm btn-icon-only" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <StatusBadge status={complaint.status} />
          <span className={`badge badge-${complaint.priority}`}>{complaint.priority}</span>
          <span className="category-tag">{complaint.category}</span>
        </div>

        <DetailField label="Location"        value={complaint.location} />
        <DetailField label="Submitted by"    value={complaint.studentName || complaint.submittedBy || 'Student'} />
        <DetailField label="Submitted"       value={new Date(complaint.submittedAt).toLocaleString('en-IN')} />
        {complaint.assignedTo && <DetailField label="Assigned to" value={complaint.assignedTo} />}

        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Description
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-main)', lineHeight: 1.7 }}>
            {complaint.description}
          </p>
        </div>

        {/* Status change */}
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Update Status
          </div>
          <select
            className="form-select"
            value={complaint.status}
            onChange={e => onStatusChange(complaint, e.target.value)}
            aria-label="Update complaint status"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <p className="form-hint" style={{ marginTop: 4 }}>
            {isFirebaseConfigured
              ? 'Status change is updated directly in Cloud Firestore.'
              : 'Status update is saved to local storage.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-main)' }}>{value}</div>
    </div>
  );
}
