// src/admin/ManageSettings.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { SkeletonForm } from './Loaders';
import AccountSecurity from './AccountSecurity';
import { FaSun, FaMoon, FaPalette, FaUserShield, FaGlobe } from 'react-icons/fa';
import styles from './Manage.module.css';

const ManageSettings = () => {
  const { settings, updateSettings, loading } = useData();
  const { theme, setThemeMode } = useTheme();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('site');

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateSettings(form);
    setSaving(false);
    if (error) alert('Failed to save: ' + error.message);
    else alert('✅ Settings saved!');
  };

  if (loading || !settings) return <SkeletonForm fields={10} />;

  const sections = [
    { id: 'site', label: 'Site Content', icon: FaGlobe },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'account', label: 'Account Security', icon: FaUserShield }
  ];

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Settings</h1>
          <p>Manage site content, appearance, and your account</p>
        </div>
      </div>

      {/* ===== SECTION NAVIGATION ===== */}
      <div className={styles.settingsTabs}>
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`${styles.settingsTab} ${activeSection === s.id ? styles.settingsTabActive : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            <s.icon />
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* ================= SECTION: SITE CONTENT ================= */}
      {activeSection === 'site' && (
        <form onSubmit={handleSubmit} className={styles.settingsForm}>
          <h2>WhatsApp</h2>
          <label>WhatsApp Number (no + or spaces)</label>
          <input
            name="whatsapp_number"
            value={form.whatsapp_number || ''}
            onChange={handleChange}
            placeholder="256743040345"
          />
          <label>Default WhatsApp Message</label>
          <textarea
            name="whatsapp_message"
            value={form.whatsapp_message || ''}
            onChange={handleChange}
            rows="2"
          />

          <h2>Contact Info</h2>
          <label>Phone</label>
          <input name="contact_phone" value={form.contact_phone || ''} onChange={handleChange} />

          <label>Email</label>
          <input name="contact_email" value={form.contact_email || ''} onChange={handleChange} />

          <label>Location</label>
          <input name="contact_location" value={form.contact_location || ''} onChange={handleChange} />

          <h2>Working Hours</h2>
          <label>Weekdays (Mon - Fri)</label>
          <input
            name="working_hours_weekdays"
            value={form.working_hours_weekdays || ''}
            onChange={handleChange}
            placeholder="Mon - Fri: 8:00 AM - 6:00 PM"
          />
          <label>Saturday</label>
          <input
            name="working_hours_saturday"
            value={form.working_hours_saturday || ''}
            onChange={handleChange}
            placeholder="Sat: 9:00 AM - 4:00 PM"
          />
          <label>Sunday</label>
          <input
            name="working_hours_sunday"
            value={form.working_hours_sunday || ''}
            onChange={handleChange}
            placeholder="Closed"
          />

          <h2>Social Media</h2>
          <label>Facebook URL</label>
          <input name="facebook_url" value={form.facebook_url || ''} onChange={handleChange} />
          <label>Twitter / X URL</label>
          <input name="twitter_url" value={form.twitter_url || ''} onChange={handleChange} />
          <label>Instagram URL</label>
          <input name="instagram_url" value={form.instagram_url || ''} onChange={handleChange} />
          <label>TikTok URL</label>
          <input name="tiktok_url" value={form.tiktok_url || ''} onChange={handleChange} />
          <label>LinkedIn URL</label>
          <input name="linkedin_url" value={form.linkedin_url || ''} onChange={handleChange} />
          <label>YouTube URL</label>
          <input name="youtube_url" value={form.youtube_url || ''} onChange={handleChange} />

          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}

      {/* ================= SECTION: APPEARANCE ================= */}
      {activeSection === 'appearance' && (
        <div className={styles.appearanceSection}>
          <h2>Theme</h2>
          <p className={styles.sectionDesc}>
            Choose how the admin panel looks. This only affects your admin panel — the public site stays the same.
          </p>

          <div className={styles.themeOptions}>
            {/* Light Theme Card */}
            <button
              type="button"
              className={`${styles.themeCard} ${theme === 'light' ? styles.themeCardActive : ''}`}
              onClick={() => setThemeMode('light')}
            >
              <div className={styles.themePreview} data-preview="light">
                <div className={styles.previewBar}></div>
                <div className={styles.previewContent}>
                  <div className={styles.previewSidebar}></div>
                  <div className={styles.previewMain}>
                    <div className={styles.previewLine}></div>
                    <div className={styles.previewLineShort}></div>
                  </div>
                </div>
              </div>
              <div className={styles.themeLabel}>
                <FaSun />
                <div>
                  <strong>Light</strong>
                  <span>Bright and clean</span>
                </div>
              </div>
              {theme === 'light' && <span className={styles.themeCheck}>✓ Active</span>}
            </button>

            {/* Dark Theme Card */}
            <button
              type="button"
              className={`${styles.themeCard} ${theme === 'dark' ? styles.themeCardActive : ''}`}
              onClick={() => setThemeMode('dark')}
            >
              <div className={styles.themePreview} data-preview="dark">
                <div className={styles.previewBar}></div>
                <div className={styles.previewContent}>
                  <div className={styles.previewSidebar}></div>
                  <div className={styles.previewMain}>
                    <div className={styles.previewLine}></div>
                    <div className={styles.previewLineShort}></div>
                  </div>
                </div>
              </div>
              <div className={styles.themeLabel}>
                <FaMoon />
                <div>
                  <strong>Dark</strong>
                  <span>Easy on the eyes</span>
                </div>
              </div>
              {theme === 'dark' && <span className={styles.themeCheck}>✓ Active</span>}
            </button>
          </div>
        </div>
      )}

      {/* ================= SECTION: ACCOUNT SECURITY ================= */}
      {activeSection === 'account' && <AccountSecurity />}
    </div>
  );
};

export default ManageSettings;