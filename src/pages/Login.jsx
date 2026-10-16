import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wrench, CheckCircle2, ClipboardList, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { loginUser } from '../services/authService';
import { isFirebaseConfigured } from '../lib/firebase';

/**
 * Login page supporting Firebase Authentication with fallback.
 */
export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [role,     setRole]     = useState('student');
  const [errors,   setErrors]   = useState({});
  const [authError, setAuthError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim()) {
      e.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      e.email = 'Enter a valid email address.';
    }
    if (!password) {
      e.password = 'Password is required.';
    } else if (password.length < 6) {
      e.password = 'Password must be at least 6 characters.';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email, password, role);
      if (!result.success) {
        setAuthError(result.error);
        setLoading(false);
        return;
      }

      onLogin?.(result.user);
      navigate(result.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setAuthError('An unexpected sign-in error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoRole) => {
    setRole(demoRole);
    setEmail(demoRole === 'admin' ? 'admin@college.edu' : 'student@college.edu');
    setPassword('demo123456');
    setErrors({});
    setAuthError('');
  };

  return (
    <div className="auth-shell">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-hero-icon">
          <Wrench size={36} />
        </div>
        <h1 className="auth-hero-title">CampusFix</h1>
        <p className="auth-hero-sub">
          Report campus issues, track resolutions, and keep your institution
          running at its best.
        </p>

        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon"><ClipboardList size={16} /></div>
            <span>Submit and track maintenance complaints in real time</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><CheckCircle2 size={16} /></div>
            <span>Get notified when your issue is resolved</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><BarChart3 size={16} /></div>
            <span>Administrators see live dashboards and metrics</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-sub">Sign in to continue to CampusFix.</p>

          {authError && (
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
                marginBottom: '16px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Role selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-role">I am signing in as</label>
              <select
                id="login-role"
                className="form-select"
                value={role}
                onChange={e => {
                  setRole(e.target.value);
                  setAuthError('');
                }}
                disabled={loading}
              >
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email address <span className="required">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                placeholder="you@college.edu"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setErrors(p => ({ ...p, email: '' }));
                  setAuthError('');
                }}
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && (
                <span className="form-error">
                  <AlertCircle size={12} />{errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className={`form-input${errors.password ? ' error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setErrors(p => ({ ...p, password: '' }));
                    setAuthError('');
                  }}
                  autoComplete="current-password"
                  style={{ paddingRight: '40px' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error">
                  <AlertCircle size={12} />{errors.password}
                </span>
              )}
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinning" style={{ animation: 'spin 1s linear infinite' }} />
                  Signing In…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Development / Demo Mode helper */}
          {!isFirebaseConfigured && (
            <div className="demo-note" style={{ marginTop: '16px' }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Dev / Local Demo Fill:</strong>&nbsp;
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0 4px', height: 'auto', fontSize: 'inherit', textDecoration: 'underline' }}
                  onClick={() => fillDemo('student')}
                >
                  Student
                </button>
                &nbsp;|&nbsp;
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0 4px', height: 'auto', fontSize: 'inherit', textDecoration: 'underline' }}
                  onClick={() => fillDemo('admin')}
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          <p className="auth-footer-link">
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
