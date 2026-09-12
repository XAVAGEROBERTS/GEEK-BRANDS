// src/components/Contact/ContactPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const { settings, services } = useData();

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

  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState(null);
  const [successName, setSuccessName] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // ===== AUTO-FILL FOR LOGGED-IN USERS =====
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setFormData((prev) => ({
          ...prev,
          email: session.user.email || prev.email,
          name: session.user.user_metadata?.full_name || prev.name
        }));
      }
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===== UPLOAD ARTWORK TO SUPABASE STORAGE =====
  const handleArtworkChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Please upload a file under 10MB.');
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
      console.error('Upload error:', uploadErr);
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
      if (path) {
        await supabase.storage.from('geekbrands').remove([path]);
      }
    }
    setArtworkUrl('');
    setUploadError('');
    setFormData((prev) => ({ ...prev, artwork: null }));
    const input = document.getElementById('artwork-input');
    if (input) input.value = '';
  };

  const generateBookingRef = () =>
    'GB-' + Math.floor(1000 + Math.random() * 9000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessRef(null);

    if (uploading) {
      setError('Please wait for the artwork upload to finish.');
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
      console.error('Supabase insert error:', insertError);
      setError('Could not submit your order. Please try again or contact us directly.');
      return;
    }

    setSuccessName(customerName);
    setSuccessRef(bookingRef);

    const { data: { session } } = await supabase.auth.getSession();
    const autofillName = session?.user?.user_metadata?.full_name || '';
    const autofillEmail = session?.user?.email || '';

    setFormData({
      name: autofillName,
      business: '',
      phone: '',
      email: autofillEmail,
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

  // ===== DYNAMIC CONTACT INFO =====
  const contactLocation = settings?.contact_location || 'Kampala, Uganda';
  const contactPhone = settings?.contact_phone || '+256 743040345';
  const contactEmail = settings?.contact_email || 'ismaelnuwamanya19@gmail.com';

  // ===== DYNAMIC WORKING HOURS =====
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

            {error && <div className={styles.errorBox}>❌ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Business / Organization</label>
                  <input
                    type="text"
                    name="business"
                    value={formData.business}
                    onChange={handleChange}
                    placeholder="Enter business name"
                  />
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
                    required
                    placeholder="Enter phone number"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Service Required *</label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                  />
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
                    placeholder="Enter size"
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
                  required
                  rows="5"
                  placeholder="Describe what you need"
                />
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
                      <strong>{formData.artwork?.name}</strong>
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

      {/* ===== SUCCESS MODAL ===== */}
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