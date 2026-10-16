import { statusClass, statusLabel, priorityClass } from '../utils/helpers';

/**
 * StatusBadge — renders a coloured pill for complaint status.
 * @param {string} status  — 'pending' | 'in-progress' | 'resolved' | 'rejected'
 * @param {boolean} dot    — show coloured dot
 */
export function StatusBadge({ status, dot = true }) {
  const cls = statusClass(status);
  return (
    <span className={`badge badge-${cls}`}>
      {dot && <span className="badge-dot" />}
      {statusLabel(status)}
    </span>
  );
}

/**
 * PriorityBadge — renders a pill for complaint priority.
 * @param {string} priority — 'high' | 'medium' | 'low'
 */
export function PriorityBadge({ priority }) {
  const cls = priorityClass(priority);
  const label = priority
    ? priority.charAt(0).toUpperCase() + priority.slice(1)
    : '—';
  return <span className={`badge badge-${cls}`}>{label}</span>;
}

/**
 * CategoryTag — mint-tinted inline tag.
 */
export function CategoryTag({ label }) {
  return <span className="category-tag">{label}</span>;
}
