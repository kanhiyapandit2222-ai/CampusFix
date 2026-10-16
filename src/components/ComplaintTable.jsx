import { formatDate } from '../utils/helpers';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { EmptyState } from './StateComponents';
import { MapPin, Eye } from 'lucide-react';

/**
 * ComplaintTable — shared table for student and admin views.
 *
 * Props:
 *   complaints   array of complaint objects
 *   showActions  boolean — show admin action buttons
 *   onView       fn(complaint) — view detail callback
 *   onStatusChange fn(complaint, newStatus) — admin callback
 *   emptyTitle   string
 *   emptyMessage string
 */
export function ComplaintTable({
  complaints = [],
  showActions = false,
  onView,
  onStatusChange,
  emptyTitle = 'No complaints found',
  emptyMessage = 'Try adjusting your filters.',
}) {
  if (complaints.length === 0) {
    return (
      <div className="card">
        <EmptyState title={emptyTitle} message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Location</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Date</th>
            {showActions && <th className="col-actions">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {complaints.map(complaint => (
            <ComplaintRow
              key={complaint.id}
              complaint={complaint}
              showActions={showActions}
              onView={onView}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComplaintRow({ complaint, showActions, onView, onStatusChange }) {
  return (
    <tr>
      <td>
        <span className="complaint-id">{complaint.id}</span>
      </td>
      <td className="col-title">
        <div style={{ maxWidth: '220px' }}>
          <div className="truncate" style={{ fontWeight: 500 }}>{complaint.title}</div>
          {(complaint.studentName || complaint.submittedBy) && (
            <div className="text-sm text-muted" style={{ marginTop: '2px' }}>
              {complaint.studentName || complaint.submittedBy}
            </div>
          )}
        </div>
      </td>
      <td>
        <span className="category-tag">
          {complaint.category}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
          <MapPin size={12} />
          <span style={{ maxWidth: '140px' }} className="truncate">{complaint.location}</span>
        </div>
      </td>
      <td>
        <PriorityBadge priority={complaint.priority} />
      </td>
      <td>
        <StatusBadge status={complaint.status} />
      </td>
      <td style={{ whiteSpace: 'nowrap', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
        {formatDate(complaint.submittedAt)}
      </td>
      {showActions && (
        <td className="col-actions">
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onView?.(complaint)}
              title="View details"
            >
              <Eye size={13} /> View
            </button>
            <select
              className="form-select"
              style={{ height: '30px', padding: '0 28px 0 8px', fontSize: 'var(--text-xs)', width: 'auto' }}
              value={complaint.status}
              onChange={e => onStatusChange?.(complaint, e.target.value)}
              aria-label="Change status"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </td>
      )}
    </tr>
  );
}
