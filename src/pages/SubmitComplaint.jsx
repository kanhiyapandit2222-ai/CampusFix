import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, CheckCircle2, AlertCircle, Bell, Image as ImageIcon, Loader2,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { CATEGORIES, LOCATIONS } from '../data/demoData';
import { submitComplaint } from '../services/complaintService';
import { isFirebaseConfigured } from '../lib/firebase';

const PRIORITIES = [
  { value: 'low',    label: 'Low — not urgent, convenient fix' },
  { value: 'medium', label: 'Medium — affects work but workable' },
  { value: 'high',   label: 'High — significant disruption or safety risk' },
];

const INITIAL = {
  title: '', category: '', description: '', location: '',
  priority: 'medium', additionalNotes: '',
};

/**
 * Submit Complaint page with Cloud Firestore persistence.
 */
export default function SubmitComplaint({ user }) {
  const navigate       = useNavigate();
  const fileInputRef   = useRef(null);
  const [form, setForm]        = useState(INITIAL);
  const [errors, setErrors]    = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading]  = useState(false);
  const [file, setFile]        = useState(null);
  const [preview, setPreview]  = useState(null);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const [dragging, setDragging]   = useState(false);

  const update = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
    setSubmitError('');
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Please enter a complaint title.';
    else if (form.title.trim().length < 8) e.title = 'Title should be at least 8 characters.';
    if (!form.category)           e.category    = 'Please select a category.';
    if (!form.description.trim()) e.description = 'Please describe the issue.';
    else if (form.description.trim().length < 20) e.description = 'Description should be at least 20 characters.';
    if (!form.location)           e.location    = 'Please select a campus location.';
    return e;
  };

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WEBP).');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5 MB.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const result = await submitComplaint({ ...form, imageUrl: preview }, user);
      if (!result.success) {
        setSubmitError(result.error);
        setLoading(false);
        return;
      }

      setSubmittedComplaint(result.complaint);
    } catch (err) {
      setSubmitError('An unexpected error occurred while saving your complaint.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedComplaint) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '32px 16px',
      }}>
        <div className="card card-padded" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '48px 40px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--color-success-bg)', color: 'var(--color-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: 8 }}>
            Complaint Submitted!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 12, fontSize: 'var(--text-sm)' }}>
            Your complaint has been recorded with ID:
          </p>
          <span className="complaint-id" style={{ fontSize: 'var(--text-md)', padding: '6px 14px', display: 'inline-block', marginBottom: 12 }}>
            {submittedComplaint.id}
          </span>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 16 }}>
            {submittedComplaint.title}
          </div>

          <div className="demo-note" style={{ marginTop: 12, textAlign: 'left' }}>
            <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1, color: 'var(--color-primary)' }} />
            <span>
              {isFirebaseConfigured
                ? 'Your complaint is saved in Cloud Firestore and available in My Complaints.'
                : 'Saved in local demo storage. Configure Firebase to store in Cloud Firestore.'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSubmittedComplaint(null);
                setForm(INITIAL);
                setFile(null);
                setPreview(null);
              }}
            >
              Submit another
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/my-complaints')}>
              View my complaints
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Submit a Complaint"
        subtitle="Report a campus maintenance issue. We'll notify the relevant team."
      />

      <div className="page-body">
        {submitError && (
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
              marginBottom: 'var(--space-5)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* Section: Basic info */}
            <div className="card card-padded">
              <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
                Complaint Details
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

                {/* Title */}
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-title">
                    Complaint Title <span className="required">*</span>
                  </label>
                  <input
                    id="cf-title"
                    type="text"
                    className={`form-input${errors.title ? ' error' : ''}`}
                    placeholder="Brief description of the issue (e.g. Broken projector in A-101)"
                    value={form.title}
                    onChange={update('title')}
                    maxLength={120}
                    disabled={loading}
                  />
                  {errors.title
                    ? <span className="form-error"><AlertCircle size={12} />{errors.title}</span>
                    : <span className="form-hint">{form.title.length}/120 characters</span>
                  }
                </div>

                <div className="form-row">
                  {/* Category */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="cf-category">
                      Category <span className="required">*</span>
                    </label>
                    <select
                      id="cf-category"
                      className={`form-select${errors.category ? ' error' : ''}`}
                      value={form.category}
                      onChange={update('category')}
                      disabled={loading}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    {errors.category && <span className="form-error"><AlertCircle size={12} />{errors.category}</span>}
                  </div>

                  {/* Priority */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="cf-priority">Priority</label>
                    <select
                      id="cf-priority"
                      className="form-select"
                      value={form.priority}
                      onChange={update('priority')}
                      disabled={loading}
                    >
                      {PRIORITIES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-location">
                    Campus Location <span className="required">*</span>
                  </label>
                  <select
                    id="cf-location"
                    className={`form-select${errors.location ? ' error' : ''}`}
                    value={form.location}
                    onChange={update('location')}
                    disabled={loading}
                  >
                    <option value="">Select campus location</option>
                    {LOCATIONS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  {errors.location && <span className="form-error"><AlertCircle size={12} />{errors.location}</span>}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-description">
                    Detailed Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="cf-description"
                    className={`form-textarea${errors.description ? ' error' : ''}`}
                    placeholder="Describe the issue in detail — when did it start, how severe is it, who is affected?"
                    value={form.description}
                    onChange={update('description')}
                    rows={5}
                    disabled={loading}
                  />
                  {errors.description
                    ? <span className="form-error"><AlertCircle size={12} />{errors.description}</span>
                    : <span className="form-hint">{form.description.length} characters (min. 20)</span>
                  }
                </div>

                {/* Additional notes */}
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-notes">Additional Notes (optional)</label>
                  <textarea
                    id="cf-notes"
                    className="form-textarea"
                    placeholder="Any extra context — contact person, access instructions, etc."
                    value={form.additionalNotes}
                    onChange={update('additionalNotes')}
                    rows={3}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section: Image upload */}
            <div className="card card-padded">
              <h2 className="section-title" style={{ marginBottom: 'var(--space-1)' }}>
                Attach Image <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--color-text-secondary)' }}>(optional)</span>
              </h2>
              <p className="section-sub" style={{ marginBottom: 'var(--space-4)' }}>
                Upload a photo of the issue to help the maintenance team. Max 5 MB, JPG/PNG/WEBP.
              </p>

              {preview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={preview}
                    alt="Complaint preview"
                    style={{ maxHeight: 200, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm btn-icon-only"
                    style={{ position: 'absolute', top: 6, right: 6 }}
                    onClick={() => { setFile(null); setPreview(null); }}
                    aria-label="Remove image"
                    disabled={loading}
                  >
                    <X size={14} />
                  </button>
                  <p className="form-hint" style={{ marginTop: 6 }}>{file?.name} ({(file?.size / 1024).toFixed(0)} KB)</p>
                </div>
              ) : (
                <div
                  className={`file-upload-area${dragging ? ' has-file' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Upload image"
                >
                  <ImageIcon size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 10px' }} />
                  <p style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: 'var(--text-sm)' }}>
                    Drag & drop or click to upload
                  </p>
                  <p className="form-hint" style={{ marginTop: 4 }}>JPG, PNG or WEBP — max 5 MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files?.[0])}
                id="cf-image"
              />
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setForm(INITIAL); setFile(null); setPreview(null); setErrors({}); setSubmitError(''); }}
                disabled={loading}
              >
                Reset Form
              </button>
              <button id="submit-complaint-btn" type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinning" style={{ animation: 'spin 1s linear infinite' }} />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Submit Complaint
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
