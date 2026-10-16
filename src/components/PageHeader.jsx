/**
 * PageHeader — consistent top bar for all authenticated pages.
 *
 * Props:
 *   title     string
 *   subtitle  string
 *   actions   ReactNode (buttons, badges, etc.)
 */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div className="page-header-left">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && (
        <div className="page-header-actions">{actions}</div>
      )}
    </header>
  );
}
