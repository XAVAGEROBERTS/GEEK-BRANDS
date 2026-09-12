// src/components/Contact/ContactPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaLock, FaTimes } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import styles from './ContactPage.module.css';

const STORAGE_KEY = 'gb_pending_order';

// ============================================================
// VALIDATION HELPERS
// ============================================================
const sanitizePhone = (v) => v.replace(/[^\d+\s\-()]/g, '');
const sanitizeName = (v) => v.replace(/[^\p{L}\s'\-]/gu, '');
const sanitizeEmail = (v) => v.replace(/\s/g, '').toLowerCase();
const sanitizeNumeric = (v) => v.replace(/\D/g, '');

const isValidPhone = (v) => v.replace(/\D/g, '').length >= 9;
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidName = (v) => v.trim().length >= 2;

const ContactPage = () => {
  const { settings, services = [] } = useData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    business: '',
    phone: '',
    email: '',
    service: '',
    quantity: '',
    size: '',
    deadline: '',
    description: '',
    artwork: null
  });

  const [artworkUrl, setArtworkUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState(null);
  const [successName, setSuccessName] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // ===== CHECK AUTH + RESTORE DRAFT =====
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        setFormData((prev) => ({ ...prev, ...saved, artwork: null }));
        if (saved.artworkUrl) setArtworkUrl(saved.artworkUrl);
      } catch (e) {
        console.warn('Bad draft', e);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
      if (session?.user) {
        setFormData((prev) => ({
          ...prev,
          email: prev.email || session.user.email || '',
          name:
            prev.name ||
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            ''
        }));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ===== SAVE DRAFT =====
  useEffect(() => {
    if (!authChecked) return;
    if (user && submitting) return;
    const draft = { ...formData, artwork: null, artworkUrl };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [formData, artworkUrl, authChecked, user, submitting]);

  // VALIDATION
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (!isValidName(value)) return 'Name must be at least 2 characters';
        return '';
      case 'business':
        if (value.trim() && value.trim().length < 2)
          return 'Business name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!isValidEmail(value)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!isValidPhone(value)) return 'Enter a valid phone (at least 9 digits)';
        return '';
      case 'service':
        if (!value.trim()) return 'Please select a service';
        return '';
      case 'quantity':
        if (value && !/^\d+$/.test(value)) return 'Quantity must be a number';
        return '';
      case 'description':
        if (!value.trim()) return 'Please describe your project';
        if (value.trim().length < 10) return 'Please add more details (min 10 chars)';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleaned = value;

    if (name === 'name') cleaned = sanitizeName(value);
    else if (name === 'phone') cleaned = sanitizePhone(value);
    else if (name === 'email') cleaned = sanitizeEmail(value);
    else if (name === 'quantity') cleaned = sanitizeNumeric(value);

    setFormData((prev) => ({ ...prev, [name]: cleaned }));

    if (fieldErrors[name]) {
      const err = validateField(name, cleaned);
      if (!err) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validateAll = () => {
    const required = ['name', 'email', 'phone', 'service', 'description'];
    const errors = {};
    required.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) errors[f] = err;
    });
    ['business', 'quantity'].forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) errors[f] = err;
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ARTWORK UPLOAD
  const handleArtworkChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Max 10MB.');
      setArtworkUrl('');
      setFormData((prev) => ({ ...prev, artwork: null }));
      return;
    }

    setUploadError('');
    setUploading(true);

    const ext = file.name.split('.').pop();
    const fileName = `artwork/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('geekbrands')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (uploadErr) {
      setUploadError('Upload failed: ' + uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('geekbrands')
      .getPublicUrl(fileName);

    setArtworkUrl(publicUrl);
    setFormData((prev) => ({ ...prev, artwork: file }));
    setUploading(false);
  };

  const clearArtwork = async () => {
    if (artworkUrl) {
      const path = artworkUrl.split('/geekbrands/')[1];
      if (path) await supabase.storage.from('geekbrands').remove([path]);
    }
    setArtworkUrl('');
    setUploadError('');
    setFormData((prev) => ({ ...prev, artwork: null }));
    const input = document.getElementById('artwork-input');
    if (input) input.value = '';
  };

  const generateBookingRef = () =>
    'GB-' + Math.floor(1000 + Math.random() * 9000);

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (uploading) {
      setError('Please wait for the artwork upload to finish.');
      return;
    }

    if (!validateAll()) {
      setError('Please fix the errors below before submitting.');
      return;
    }

    // 🚫 NOT LOGGED IN → redirect to login (like OrderPage)
    if (!user) {
      const draft = { ...formData, artwork: null, artworkUrl };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setShowLoginModal(true);
      return;
    }

    setSubmitting(true);

    const bookingRef = generateBookingRef();
    const customerName = formData.name;

    const { error: insertError } = await supabase.from('orders').insert([
      {
        booking_ref: bookingRef,
        customer: formData.name,
        business: formData.business,
        phone: formData.phone,
        email: formData.email,
        service: formData.service,
        quantity: formData.quantity,
        size: formData.size,
        deadline: formData.deadline || null,
        description: formData.description,
        artwork_url: artworkUrl || null,
        status: 'Pending',
        progress: 0
      }
    ]);

    setSubmitting(false);

    if (insertError) {
      console.error('Insert error:', insertError);
      setError('Could not submit your order. Please try again.');
      return;
    }

    setSuccessName(customerName);
    setSuccessRef(bookingRef);
    localStorage.removeItem(STORAGE_KEY);
    setFieldErrors({});

    const { data: { session } } = await supabase.auth.getSession();
    setFormData({
      name: session?.user?.user_metadata?.full_name || '',
      business: '',
      phone: '',
      email: session?.user?.email || '',
      service: '',
      quantity: '',
      size: '',
      deadline: '',
      description: '',
      artwork: null
    });
    setArtworkUrl('');
    const input = document.getElementById('artwork-input');
    if (input) input.value = '';
  };

  // ===== LOGIN HANDLERS =====
  const handleGoogle = async () => {
    const draft = { ...formData, artwork: null, artworkUrl };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/contact` }
    });
    if (error) alert('Google sign-in failed: ' + error.message);
  };

  const handleEmailLogin = () => {
    const draft = { ...formData, artwork: null, artworkUrl };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    navigate('/login?redirect=/contact');
  };

  const closeSuccess = () => {
    setSuccessRef(null);
    setSuccessName('');
    setCopied(false);
  };

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(successRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = successRef;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const contactLocation = settings?.contact_location || 'Kampala, Uganda';
  const contactPhone = settings?.contact_phone || '+256 743040345';
  const contactEmail = settings?.contact_email || 'ismaelnuwamanya19@gmail.com';
  const workingWeekdays =
    settings?.working_hours_weekdays || 'Mon - Fri: 8:00 AM - 6:00 PM';
  const workingSaturday =
    settings?.working_hours_saturday || 'Sat: 9:00 AM - 4:00 PM';
  const workingSunday = settings?.working_hours_sunday || 'Closed';

  return (
    <section className="container">
      <div className={styles.contactPage}>
        <div className="section-title">
          <span className="badge">Contact Us</span>
          <h2>Let's get your brand looking</h2>
          <p>
            Have an order? Have an idea? Have absolutely no idea where to start?
            That's okay. Talk to us.
          </p>
        </div>

        <div className={styles.contactContent}>
          <div className={styles.orderForm}>
            <h3>Tell us what you need</h3>

            {user && (
              <div className={styles.loggedInBanner}>
                ✅ Signed in as <strong>{user.email}</strong>
              </div>
            )}

            {error && <div className={styles.errorBox}>❌ {error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Enter your name"
                    className={fieldErrors.name ? styles.inputError : ''}
                  />
                  {fieldErrors.name && (
                    <span className={styles.fieldErrorMsg}>{fieldErrors.name}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>Business / Organization</label>
                  <input
                    type="text"
                    name="business"
                    value={formData.business}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter business name"
                    className={fieldErrors.business ? styles.inputError : ''}
                  />
                  {fieldErrors.business && (
                    <span className={styles.fieldErrorMsg}>{fieldErrors.business}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="+256 700 000 000"
                    className={fieldErrors.phone ? styles.inputError : ''}
                    inputMode="tel"
                  />
                  {fieldErrors.phone && (
                    <span className={styles.fieldErrorMsg}>{fieldErrors.phone}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="you@example.com"
                    className={fieldErrors.email ? styles.inputError : ''}
                    inputMode="email"
                  />
                  {fieldErrors.email && (
                    <span className={styles.fieldErrorMsg}>{fieldErrors.email}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Service Required *</label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={fieldErrors.service ? styles.inputError : ''}
                  >
                    <option value="">Select service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.service && (
                    <span className={styles.fieldErrorMsg}>{fieldErrors.service}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter quantity (digits only)"
                    className={fieldErrors.quantity ? styles.inputError : ''}
                    inputMode="numeric"
                  />
                  {fieldErrors.quantity && (
                    <span className={styles.fieldErrorMsg}>{fieldErrors.quantity}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Size / Dimensions</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="e.g. 10cm x 15cm"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Tell us about your project *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  rows="5"
                  placeholder="Describe what you need"
                  className={fieldErrors.description ? styles.inputError : ''}
                />
                {fieldErrors.description && (
                  <span className={styles.fieldErrorMsg}>{fieldErrors.description}</span>
                )}
                <span className={styles.charCount}>
                  {formData.description.length} characters
                </span>
              </div>

              <div className={styles.formGroup}>
                <label>Upload artwork/logo</label>
                <input
                  id="artwork-input"
                  type="file"
                  onChange={handleArtworkChange}
                  accept="image/*,.pdf,.ai,.psd"
                  disabled={uploading}
                />

                {uploading && (
                  <div className={styles.uploadStatus}>⏳ Uploading...</div>
                )}

                {uploadError && (
                  <div className={styles.uploadError}>❌ {uploadError}</div>
                )}

                {artworkUrl && !uploading && (
                  <div className={styles.uploadPreview}>
                    <div className={styles.uploadThumb}>
                      {formData.artwork?.type?.startsWith('image/') ? (
                        <img src={artworkUrl} alt="Artwork preview" />
                      ) : (
                        <span>📄</span>
                      )}
                    </div>
                    <div className={styles.uploadMeta}>
                      <strong>{formData.artwork?.name || 'Artwork'}</strong>
                      <span>✓ Uploaded successfully</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearArtwork}
                      className={styles.removeArtwork}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || uploading}
              >
                {submitting ? 'Submitting...' : uploading ? 'Uploading...' : 'MAKE MY ORDER'}
              </button>
            </form>
          </div>

          <div className={styles.contactInfo}>
            <h3>Contact Information</h3>

            <div className={styles.infoItem}>
              <span>📍</span>
              <div>
                <h4>Location</h4>
                <p>{contactLocation}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span>📞</span>
              <div>
                <h4>Phone</h4>
                <p>{contactPhone}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span>✉️</span>
              <div>
                <h4>Email</h4>
                <p>{contactEmail}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span>🕐</span>
              <div>
                <h4>Working Hours</h4>
                <p>{workingWeekdays}</p>
                <p>{workingSaturday}</p>
                {workingSunday &&
                  workingSunday.toLowerCase() !== 'closed' &&
                  workingSunday.toLowerCase() !== 'none' && (
                    <p>{workingSunday}</p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div
          className={styles.successOverlay}
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className={styles.successModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeModalBtn}
              onClick={() => setShowLoginModal(false)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: 32,
                height: 32,
                padding: 0,
                borderRadius: '50%',
                background: '#f5f5f5'
              }}
            >
              <FaTimes />
            </button>

            <div className={styles.successIconWrap}>
              <div
                className={styles.successIcon}
                style={{ background: 'linear-gradient(135deg, #ad1380, #df006e)' }}
              >
                <FaLock />
              </div>
            </div>

            <h2 className={styles.successTitle}>Sign in to submit your order</h2>
            <p className={styles.successSubtitle}>
              Your details are <strong>saved</strong>. Log in to finish submitting — we'll bring you right back.
            </p>

            <div className={styles.successActions} style={{ flexDirection: 'column' }}>
              <button
                type="button"
                onClick={handleGoogle}
                className={styles.trackBtn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  background: '#fff',
                  color: '#1a1a1a',
                  border: '2px solid #e7e7e7'
                }}
              >
                <FaGoogle style={{ color: '#4285f4' }} /> Continue with Google
              </button>
              <button
                type="button"
                onClick={handleEmailLogin}
                className={styles.trackBtn}
              >
                Continue with Email
              </button>
            </div>

            <p className={styles.refHint} style={{ marginTop: '1rem' }}>
              🔒 We only use your account to track your orders.
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {successRef && (
        <div className={styles.successOverlay} onClick={closeSuccess}>
          <div
            className={styles.successModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.successIconWrap}>
              <div className={styles.successIcon}>✓</div>
            </div>

            <h2 className={styles.successTitle}>Order Submitted!</h2>
            <p className={styles.successSubtitle}>
              Thanks {successName ? `, ${successName}` : ''} — we've received your order and will contact you within 24 hours.
            </p>

            <div className={styles.refBox}>
              <span className={styles.refLabel}>Your Booking Reference</span>
              <div className={styles.refRow}>
                <span className={styles.refValue}>{successRef}</span>
                <button type="button" onClick={copyRef} className={styles.copyBtn}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className={styles.refHint}>
                Save this ref to track your order anytime at <strong>/manage</strong>
              </p>
            </div>

            <div className={styles.successActions}>
              <a href="/manage" className={styles.trackBtn}>Track My Order</a>
              <button type="button" onClick={closeSuccess} className={styles.closeModalBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContactPage;