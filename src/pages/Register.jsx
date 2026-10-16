import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wrench, AlertCircle, CheckCircle2, ClipboardList, BarChart3, Loader2 } from 'lucide-react';
import { registerNewStudent } from '../services/authService';

const STUDENT_DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Other',
];

/**
 * Registration page for Student accounts.
 * Note: Per CampusFix security specification, public signup only creates Student accounts.
 * Administrator accounts must be provisioned securely via Admin SDK custom claims.
 */
export default function Register({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', rollNumber: '', email: '', department: '',
    year: '', password: '', confirmPassword: '',
  });
  const [showPw,    setShowPw]    = useState(false);
  const [showCnf,   setShowCnf]   = useState(false);
  const [errors,    setErrors]    = useState({});
  const [authError, setAuthError] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
    setAuthError('');
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) {
      e.fullName = 'Full name is required.';
    }

    if (!form.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Enter a valid email address.';
    }

    if (!form.rollNumber.trim()) {
      e.rollNumber = 'Roll number is required.';
    }
    if (!form.department) {
      e.department = 'Please select your department.';
    }
    if (!form.year) {
      e.year = 'Please select your year.';
    }

    if (!form.password) {
      e.password = 'Password is required.';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters.';
    }

    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (form.confirmPassword !== form.password) {
      e.confirmPassword = 'Passwords do not match.';
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
      const result = await registerNewStudent(form);
      if (!result.success) {
        setAuthError(result.error);
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        onLogin?.(result.user);
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setAuthError('An unexpected registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--color-bg-page)',
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--color-success-bg)', color: 'var(--color-success)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle2 size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Account created successfully!</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Setting up your session and redirecting you to your dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      {/* Left */}
      <div className="auth-left">
        <div className="auth-hero-icon"><Wrench size={36} /></div>
        <h1 className="auth-hero-title">Join CampusFix</h1>
        <p className="auth-hero-sub">
          Create your student account to report and track campus maintenance issues
          directly with facility managers.
        </p>
        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon"><ClipboardList size={16} /></div>
            <span>Raise complaints from anywhere on campus</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><CheckCircle2 size={16} /></div>
            <span>Receive real-time status updates</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><BarChart3 size={16} /></div>
            <span>View your complaint history and resolution stats</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="auth-right" style={{ overflowY: 'auto' }}>
        <div className="auth-form-box">
          <h2 className="auth-form-title">Student Registration</h2>
          <p className="auth-form-sub">Fill in your academic details to get started.</p>

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
            {/* Full name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name <span className="required">*</span></label>
              <input
                id="reg-name"
                type="text"
                className={`form-input${errors.fullName ? ' error' : ''}`}
                placeholder="Your full name"
                value={form.fullName}
                onChange={update('fullName')}
                disabled={loading}
              />
              {errors.fullName && <span className="form-error"><AlertCircle size={12} />{errors.fullName}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">College Email <span className="required">*</span></label>
              <input
                id="reg-email"
                type="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                placeholder="you@college.edu"
                value={form.email}
                onChange={update('email')}
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && <span className="form-error"><AlertCircle size={12} />{errors.email}</span>}
            </div>

            {/* Student academic fields */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-roll">Roll Number <span className="required">*</span></label>
                <input
                  id="reg-roll"
                  type="text"
                  className={`form-input${errors.rollNumber ? ' error' : ''}`}
                  placeholder="e.g. CS2021047"
                  value={form.rollNumber}
                  onChange={update('rollNumber')}
                  disabled={loading}
                />
                {errors.rollNumber && <span className="form-error"><AlertCircle size={12} />{errors.rollNumber}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-year">Year <span className="required">*</span></label>
                <select
                  id="reg-year"
                  className={`form-select${errors.year ? ' error' : ''}`}
                  value={form.year}
                  onChange={update('year')}
                  disabled={loading}
                >
                  <option value="">Select year</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>Postgraduate</option>
                </select>
                {errors.year && <span className="form-error"><AlertCircle size={12} />{errors.year}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-dept">Department <span className="required">*</span></label>
              <select
                id="reg-dept"
                className={`form-select${errors.department ? ' error' : ''}`}
                value={form.department}
                onChange={update('department')}
                disabled={loading}
              >
                <option value="">Select department</option>
                {STUDENT_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
              {errors.department && <span className="form-error"><AlertCircle size={12} />{errors.department}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  className={`form-input${errors.password ? ' error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={update('password')}
                  style={{ paddingRight: '40px' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  aria-label={showPw ? 'Hide' : 'Show'}
                  onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error"><AlertCircle size={12} />{errors.password}</span>}
            </div>

            {/* Confirm password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-confirm"
                  type={showCnf ? 'text' : 'password'}
                  className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  style={{ paddingRight: '40px' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  aria-label={showCnf ? 'Hide' : 'Show'}
                  onClick={() => setShowCnf(p => !p)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                >
                  {showCnf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="form-error"><AlertCircle size={12} />{errors.confirmPassword}</span>}
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinning" style={{ animation: 'spin 1s linear infinite' }} />
                  Creating Account…
                </>
              ) : (
                'Create Student Account'
              )}
            </button>
          </form>

          <p className="auth-footer-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
