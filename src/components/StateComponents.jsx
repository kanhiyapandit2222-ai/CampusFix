import { Loader2, Inbox, AlertTriangle } from 'lucide-react';

/**
 * LoadingState — centered spinner with optional message.
 */
export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="state-container">
      <div className="state-icon loading">
        <Loader2 size={24} className="spin-anim" style={{ animation: 'spin 0.7s linear infinite' }} />
      </div>
      <p className="state-title">{message}</p>
      <p className="state-sub">Please wait a moment.</p>
    </div>
  );
}

/**
 * EmptyState — no-data illustration with optional action.
 */
export function EmptyState({
  title = 'Nothing here yet',
  message = 'There are no items to display.',
  action = null,
}) {
  return (
    <div className="state-container">
      <div className="state-icon empty">
        <Inbox size={26} />
      </div>
      <p className="state-title">{title}</p>
      <p className="state-sub">{message}</p>
      {action && <div style={{ marginTop: '12px' }}>{action}</div>}
    </div>
  );
}

/**
 * ErrorState — error illustration with retry option.
 */
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state-container">
      <div className="state-icon error">
        <AlertTriangle size={26} />
      </div>
      <p className="state-title">An error occurred</p>
      <p className="state-sub">{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry} style={{ marginTop: '12px' }}>
          Try again
        </button>
      )}
    </div>
  );
}
