// src/admin/ManageServices.jsx
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaTimes,
  FaEye,
  FaUpload,
  FaLink,
  FaImage
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { SkeletonList } from './Loaders';
import styles from './Manage.module.css';

const emptyService = {
  slug: '',
  title: '',
  short_description: '',
  description: '',
  color: '#ad1380',
  image_url: '',
  hero_heading: '',
  hero_subheading: '',
  services_list: [],
  process: [],
  key_message: '',
  copy: '',
  cta: '',
  cta_button: '',
  sort_order: 0
};

const ManageServices = () => {
  const {
    services = [],
    addService,
    updateService,
    deleteService,
    loading
  } = useData();

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [activeTab, setActiveTab] = useState('basics');

  const [listDraft, setListDraft] = useState('');
  const [processDraft, setProcessDraft] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const openNew = () => {
    setEditing('new');
    setForm({ ...emptyService, sort_order: services.length });
    setListDraft('');
    setProcessDraft('');
    setUploadError('');
    setActiveTab('basics');
  };

  const openEdit = (svc) => {
    setEditing(svc.id);
    const list = svc.services_list || [];
    const proc = svc.process || [];
    setForm({
      ...emptyService,
      ...svc,
      services_list: list,
      process: proc,
      image_url: svc.image_url || ''
    });
    setListDraft(list.join('\n'));
    setProcessDraft(proc.join('\n'));
    setUploadError('');
    setActiveTab('basics');
  };

  const closeForm = () => {
    setEditing(null);
    setForm(emptyService);
    setListDraft('');
    setProcessDraft('');
    setUploadError('');
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug:
        editing === 'new'
          ? title
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
          : prev.slug
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image too large. Max 5MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed.');
      return;
    }

    setUploadError('');
    setUploading(true);

    const ext = file.name.split('.').pop();
    const fileName = `services/${Date.now()}-${Math.random()
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

    setForm((prev) => ({ ...prev, image_url: publicUrl }));
    setUploading(false);
  };

  const clearImage = async () => {
    const url = form.image_url;
    if (url && url.includes('/geekbrands/')) {
      const path = url.split('/geekbrands/')[1];
      if (path) await supabase.storage.from('geekbrands').remove([path]);
    }
    setForm((prev) => ({ ...prev, image_url: '' }));
    setUploadError('');
    const input = document.getElementById('service-image-input');
    if (input) input.value = '';
  };

  const parseDraft = (text) =>
    text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.slug) return alert('Slug is required.');
    if (!form.title) return alert('Title is required.');
    if (!form.image_url) return alert('Service image is required. Please upload or paste an image URL.');

    const payload = {
      ...form,
      services_list: parseDraft(listDraft),
      process: parseDraft(processDraft)
    };

    if (editing === 'new') {
      const { error } = await addService(payload);
      if (error) alert('Failed to add: ' + error.message);
    } else {
      const { error } = await updateService(editing, payload);
      if (error) alert('Failed to update: ' + error.message);
    }
    closeForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    const { error } = await deleteService(id);
    if (error) alert('Delete failed: ' + error.message);
  };

  const tabs = [
    { id: 'basics', label: '1. Basics', desc: 'Title, slug, image' },
    { id: 'hero', label: '2. Hero Section', desc: 'Service page hero' },
    { id: 'content', label: '3. Content', desc: 'What we offer + list' },
    { id: 'cta', label: '4. Calls to Action', desc: 'Buttons + taglines' }
  ];

  return (
    <div>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Services</h1>
          <p>Manage your service offerings — these power the entire site</p>
        </div>
        <button onClick={openNew} className={styles.addBtn}>
          <FaPlus /> Add Service
        </button>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className={styles.modal}>
          <div className={styles.modalContentLarge}>
            <button onClick={closeForm} className={styles.closeBtn}>
              <FaTimes />
            </button>

            <div className={styles.modalHeader}>
              <h2>{editing === 'new' ? 'New Service' : 'Edit Service'}</h2>
              <p className={styles.modalSubtitle}>
                {editing === 'new'
                  ? 'Create a new service that appears across your public site.'
                  : `Editing: ${form.title || 'Untitled Service'}`}
              </p>
            </div>

            {/* TABS */}
            <div className={styles.tabsNav}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <strong>{tab.label}</strong>
                  <span>{tab.desc}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* ================= TAB 1: BASICS ================= */}
              {activeTab === 'basics' && (
                <div className={styles.tabPane}>
                  <div className={styles.fieldGroup}>
                    <label>
                      Service Title <span className={styles.required}>*</span>
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleTitleChange}
                      required
                      placeholder="e.g. Product Stickers & Packaging"
                    />
                    <small>Shown in navigation, cards, and pages.</small>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>
                      URL Slug <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.slugPreview}>
                      <span className={styles.slugPrefix}>/services/</span>
                      <input
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        required
                        placeholder="product-stickers-packaging"
                        className={styles.slugInput}
                      />
                    </div>
                    <small>Auto-generated from title. Must be unique.</small>
                  </div>

                  {/* ===== SERVICE IMAGE ===== */}
                  <div className={styles.fieldGroup}>
                    <label>
                      Service Image <span className={styles.required}>*</span>
                    </label>
                    <p className={styles.helper}>
                      Upload a photo (recommended: 800×500, 16:10 ratio). This
                      is required — it powers the service card and detail page.
                    </p>

                    <div className={styles.imageUploadRow}>
                      <label className={styles.uploadBtn} htmlFor="service-image-input">
                        <FaUpload /> {uploading ? 'Uploading…' : 'Upload Image'}
                      </label>
                      <input
                        id="service-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        hidden
                      />
                      <span className={styles.orDivider}>or</span>
                      <div className={styles.urlInputWrap}>
                        <FaLink className={styles.urlIcon} />
                        <input
                          type="url"
                          name="image_url"
                          value={form.image_url || ''}
                          onChange={handleChange}
                          placeholder="https://… paste image URL"
                          className={styles.urlInput}
                        />
                      </div>
                    </div>

                    {uploadError && (
                      <div className={styles.uploadErrorBox}>❌ {uploadError}</div>
                    )}

                    {form.image_url && (
                      <div className={styles.imagePreviewWrap}>
                        <div
                          className={styles.imagePreview}
                          style={{
                            background: form.color
                              ? `linear-gradient(135deg, ${form.color}22, ${form.color}44)`
                              : undefined
                          }}
                        >
                          <img src={form.image_url} alt="Service preview" />
                        </div>
                        <button
                          type="button"
                          onClick={clearImage}
                          className={styles.removeImageBtn}
                        >
                          <FaTrash /> Remove image
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Brand Color</label>
                    <div className={styles.colorRow}>
                      <input
                        type="color"
                        name="color"
                        value={form.color || '#ad1380'}
                        onChange={handleChange}
                        className={styles.colorPicker}
                      />
                      <input
                        name="color"
                        value={form.color || ''}
                        onChange={handleChange}
                        placeholder="#ad1380"
                      />
                    </div>
                    <small>Used for subtle background tints.</small>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Short Description (for cards)</label>
                    <textarea
                      name="short_description"
                      value={form.short_description || ''}
                      onChange={handleChange}
                      rows="2"
                      placeholder="A short line shown on the services grid and homepage."
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Full Description (for detail page)</label>
                    <textarea
                      name="description"
                      value={form.description || ''}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Longer description shown on the service page."
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Sort Order</label>
                    <input
                      name="sort_order"
                      type="number"
                      value={form.sort_order}
                      onChange={handleChange}
                    />
                    <small>Lower numbers appear first.</small>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: HERO ================= */}
              {activeTab === 'hero' && (
                <div className={styles.tabPane}>
                  <p className={styles.tabHint}>
                    These appear at the top of the individual service page.
                  </p>

                  <div className={styles.fieldGroup}>
                    <label>Hero Heading</label>
                    <input
                      name="hero_heading"
                      value={form.hero_heading || ''}
                      onChange={handleChange}
                      placeholder="Your products deserve to stand out."
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Hero Subheading</label>
                    <textarea
                      name="hero_subheading"
                      value={form.hero_subheading || ''}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Give your products the shelf appeal they deserve..."
                    />
                  </div>

                  <div className={styles.previewBox}>
                    <span className={styles.previewLabel}>Live Preview</span>
                    <div
                      className={styles.previewHero}
                      style={{
                        background: `linear-gradient(135deg, ${form.color || '#ad1380'}22, ${form.color || '#ad1380'}44)`
                      }}
                    >
                      {form.image_url && (
                        <div className={styles.previewImageBox}>
                          <img src={form.image_url} alt="preview" />
                        </div>
                      )}
                      <h3>{form.hero_heading || 'Hero heading will appear here'}</h3>
                      <p>{form.hero_subheading || 'Hero subheading will appear here'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: CONTENT ================= */}
              {activeTab === 'content' && (
                <div className={styles.tabPane}>
                  <div className={styles.fieldGroup}>
                    <label>Services List (one per line)</label>
                    <textarea
                      value={listDraft}
                      onChange={(e) => setListDraft(e.target.value)}
                      rows="8"
                      placeholder={'Soap labels\nHoney labels\nJar labels\nProduct seals\nRound stickers'}
                    />
                    <small>
                      Press Enter after each item. Empty lines are ignored on save.
                    </small>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Process Steps (one per line, optional)</label>
                    <textarea
                      value={processDraft}
                      onChange={(e) => setProcessDraft(e.target.value)}
                      rows="4"
                      placeholder={'Design\nProof\nPrint\nFinish\nDeliver'}
                    />
                    <small>
                      Shows numbered steps on the service page. Leave empty to hide.
                    </small>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Key Message (optional)</label>
                    <textarea
                      name="key_message"
                      value={form.key_message || ''}
                      onChange={handleChange}
                      rows="2"
                      placeholder="One vehicle can generate thousands of impressions over time."
                    />
                    <small>Highlighted callout on the service page.</small>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Copy / Tagline (optional)</label>
                    <textarea
                      name="copy"
                      value={form.copy || ''}
                      onChange={handleChange}
                      rows="2"
                      placeholder="You bring the idea. We make it big."
                    />
                    <small>Short italic-style message shown below the list.</small>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: CTA ================= */}
              {activeTab === 'cta' && (
                <div className={styles.tabPane}>
                  <p className={styles.tabHint}>
                    Buttons that drive users to take action.
                  </p>

                  <div className={styles.fieldGroup}>
                    <label>CTA Text (short message)</label>
                    <input
                      name="cta"
                      value={form.cta || ''}
                      onChange={handleChange}
                      placeholder="Have a product? Let's give it a proper outfit."
                    />
                    <small>Small line that appears above the button.</small>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>CTA Button Label</label>
                    <input
                      name="cta_button"
                      value={form.cta_button || ''}
                      onChange={handleChange}
                      placeholder="ORDER PRODUCT STICKERS"
                    />
                    <small>The actual button text users click.</small>
                  </div>

                  <div className={styles.previewBox}>
                    <span className={styles.previewLabel}>Button Preview</span>
                    <button
                      type="button"
                      className={styles.previewBtn}
                      style={{ background: form.color || '#ad1380' }}
                    >
                      {form.cta_button || 'CTA Button'}
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={closeForm}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={uploading}
                >
                  {editing === 'new' ? 'Create Service' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICES LIST */}
      {loading ? (
        <SkeletonList rows={6} />
      ) : (
        <div className={styles.list}>
          {services.length === 0 && (
            <p className={styles.empty}>
              No services yet. Click "Add Service" to create one.
            </p>
          )}
          {services.map((svc) => (
            <div key={svc.id} className={styles.item}>
              {svc.image_url ? (
                <img
                  src={svc.image_url}
                  alt={svc.title}
                  className={styles.thumb}
                />
              ) : (
                <div className={styles.thumbPlaceholder}>
                  <FaImage />
                </div>
              )}
              <div className={styles.info}>
                <h3>{svc.title}</h3>
                <span className={styles.badge}>/services/{svc.slug}</span>
                <p>{svc.short_description}</p>
              </div>
              <div className={styles.actions}>
                <a
                  href={`/services/${svc.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewBtn}
                  title="View on site"
                >
                  <FaEye />
                </a>
                <button
                  onClick={() => openEdit(svc)}
                  className={styles.editBtn}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(svc.id)}
                  className={styles.deleteBtn}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageServices;