/**
 * Utility helpers — Phase 1 (UI only)
 */

/** Format ISO date string to a readable local date */
export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Format ISO date with time */
export function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Return initials from a full name */
export function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('');
}

/** Map status string to badge CSS class suffix */
export function statusClass(status) {
  const map = {
    pending:     'pending',
    'in-progress': 'in-progress',
    resolved:    'resolved',
    rejected:    'rejected',
  };
  return map[status] ?? 'neutral';
}

/** Human-readable status label */
export function statusLabel(status) {
  const map = {
    pending:       'Pending',
    'in-progress': 'In Progress',
    resolved:      'Resolved',
    rejected:      'Rejected',
  };
  return map[status] ?? status;
}

/** Map priority to badge class */
export function priorityClass(priority) {
  const map = { high: 'high', medium: 'medium', low: 'low' };
  return map[priority] ?? 'low';
}

/** Capitalize first letter */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
