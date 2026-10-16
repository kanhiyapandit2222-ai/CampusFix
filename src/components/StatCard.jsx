/**
 * StatCard — summary metric card used in dashboards.
 *
 * Props:
 *   label       string   — metric label
 *   value       number|string — primary number
 *   icon        ReactNode
 *   iconBg      string   — background colour for icon container
 *   iconColor   string   — icon colour
 *   change      string   — e.g. "+3 this week"
 *   changeType  'up'|'down'|'neu'
 *   accent      boolean  — use teal border accent on left
 */
export function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  change,
  changeType = 'neu',
  accent = false,
}) {
  return (
    <div
      className="stat-card"
      style={accent ? { borderLeft: '3px solid var(--color-primary)' } : {}}
    >
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {icon && (
          <div
            className="stat-card-icon"
            style={{
              background: iconBg ?? 'var(--color-mint)',
              color: iconColor ?? 'var(--color-primary)',
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="stat-card-value">{value ?? '—'}</div>
      {change && (
        <div className={`stat-card-change stat-change-${changeType}`}>
          {change}
        </div>
      )}
    </div>
  );
}
