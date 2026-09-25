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
  process: [],
  key_message: '',
  copy: '',
  cta: '',
  cta_button: '',
  sort_order: 0,
  sub_services: []
};

const emptySub = {
  title: '',
  description: '',
  image_url: ''
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

  const [processDraft, setProcessDraft] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [subUploadingIndex, setSubUploadingIndex] = useState(null);

  const openNew = () => {
    setEditing('new');
    setForm({ ...emptyService, sort_order: services.length });
    setProcessDraft('');
    setUploadError('');
    setActiveTab('basics');
  };

  const openEdit = (svc) => {
    setEditing(svc.id);
    const proc = svc.process || [];
    const subs = Array.isArray(svc.sub_services) ? svc.sub_services : [];
    setForm({
      ...emptyService,
      ...svc,
      process: proc,
      sub_services: subs,
      image_url: svc.image_url || ''
    });
    setProcessDraft(proc.join('\n'));
    setUploadError('');
    setActiveTab('basics');
  };

  const closeForm = () => {
    setEditing(null);
    setForm(emptyService);
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

  // ===== MAIN IMAGE =====
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

  // ===== SUB-SERVICES =====
  const addSubService = () => {
    setForm((prev) => ({
      ...prev,
      sub_services: [...(prev.sub_services || []), { ...emptySub }]
    }));
  };

  const removeSubService = (index) => {
    setForm((prev) => ({
      ...prev,
      sub_services: (prev.sub_services || []).filter((_, i) => i !== index)
    }));
  };

  const updateSubService = (index, field, value) => {
    setForm((prev) => {
      const next = [...(prev.sub_services || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, sub_services: next };
    });
  };

  const handleSubImageUpload = async (index, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Max 5MB.');
      return;
    }

    setSubUploadingIndex(index);

    const ext = file.name.split('.').pop();
    const fileName = `services/sub/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('geekbrands')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (uploadErr) {
      alert('Upload failed: ' + uploadErr.message);
      setSubUploadingIndex(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('geekbrands')
      .getPublicUrl(fileName);

    updateSubService(index, 'image_url', publicUrl);
    setSubUploadingIndex(null);
  };

  // ===== SAVE =====
  const parseDraft = (text) =>
    text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.slug) return alert('Slug is required.');
    if (!form.title) return alert('Title is required.');
    if (!form.image_url)
      return alert('Service image is required. Please upload or paste an image URL.');

    const payload = {
      ...form,
      process: parseDraft(processDraft),
      sub_services: form.sub_services || []
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
    { id: 'hero', label: '2. Hero', desc: 'Service page hero' },
    { id: 'content', label: '3. Content', desc: 'Sub-services + process' },
    { id: 'cta', label: '4. CTA', desc: 'Buttons + taglines' }
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
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>
                      Service Image <span className={styles.required}>*</span>
                    </label>
                    <p className={styles.helper}>
                      Upload a photo (recommended: 800×500, 16:10 ratio).
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
                        <div className={styles.imagePreview}>
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
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Short Description (for cards)</label>
                    <textarea
                      name="short_description"
                      value={form.short_description || ''}
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Full Description</label>
                    <textarea
                      name="description"
                      value={form.description || ''}
                      onChange={handleChange}
                      rows="3"
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
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Hero Subheading</label>
                    <textarea
                      name="hero_subheading"
                      value={form.hero_subheading || ''}
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>
                </div>
              )}

              {/* ================= TAB 3: CONTENT ================= */}
              {activeTab === 'content' && (
                <div className={styles.tabPane}>
                  {/* ===== SUB-SERVICES ===== */}
                  <div className={styles.fieldGroup}>
                    <label style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                      Sub-Services (child services)
                    </label>
                    <p className={styles.helper}>
                      Each child service displays as an image card on the service detail page.
                      This replaces the old text list — add one per child you offer.
                    </p>

                    {form.sub_services?.length === 0 && (
                      <div
                        style={{
                          background: '#faf5fb',
                          border: '1px dashed #e0d1e8',
                          borderRadius: '12px',
                          padding: '1.5rem 1rem',
                          textAlign: 'center',
                          color: '#888',
                          fontSize: '0.85rem',
                          marginBottom: '1rem'
                        }}
                      >
                        No child services yet. Click <strong>+ Add Sub-Service</strong> below.
                      </div>
                    )}

                    {form.sub_services?.map((sub, index) => (
                      <div
                        key={index}
                        style={{
                          background: '#faf5fb',
                          border: '1px solid #f0e0f0',
                          borderRadius: '12px',
                          padding: '1rem',
                          marginBottom: '1rem',
                          position: 'relative'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => removeSubService(index)}
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: '#fff3f3',
                            color: '#e74c3c',
                            border: '1px solid #ffd7d7',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          aria-label="Remove sub-service"
                        >
                          <FaTimes />
                        </button>

                        <div className={styles.fieldGroup}>
                          <label>Title</label>
                          <input
                            value={sub.title || ''}
                            onChange={(e) =>
                              updateSubService(index, 'title', e.target.value)
                            }
                            placeholder="e.g. Soap Labels"
                          />
                        </div>

                        <div className={styles.fieldGroup}>
                          <label>Description (optional)</label>
                          <textarea
                            value={sub.description || ''}
                            onChange={(e) =>
                              updateSubService(index, 'description', e.target.value)
                            }
                            rows="2"
                            placeholder="Short description"
                          />
                        </div>

                        <div className={styles.fieldGroup}>
                          <label>Image</label>
                          <div className={styles.imageUploadRow}>
                            <label
                              className={styles.uploadBtn}
                              htmlFor={`sub-image-${index}`}
                            >
                              <FaUpload />
                              {subUploadingIndex === index
                                ? 'Uploading…'
                                : 'Upload Image'}
                            </label>
                            <input
                              id={`sub-image-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleSubImageUpload(index, e.target.files[0])
                              }
                              disabled={subUploadingIndex === index}
                              hidden
                            />
                            <span className={styles.orDivider}>or</span>
                            <div className={styles.urlInputWrap}>
                              <FaLink className={styles.urlIcon} />
                              <input
                                type="url"
                                value={sub.image_url || ''}
                                onChange={(e) =>
                                  updateSubService(index, 'image_url', e.target.value)
                                }
                                placeholder="https://… image URL"
                                className={styles.urlInput}
                              />
                            </div>
                          </div>

                          {sub.image_url && (
                            <div
                              className={styles.imagePreview}
                              style={{ marginTop: '0.6rem', maxWidth: '200px' }}
                            >
                              <img src={sub.image_url} alt={sub.title || 'sub'} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addSubService}
                      className={styles.addBtn}
                      style={{ marginTop: '0.5rem' }}
                    >
                      <FaPlus /> Add Sub-Service
                    </button>
                  </div>

                  {/* ===== PROCESS STEPS ===== */}
                  <div className={styles.fieldGroup} style={{ marginTop: '1.5rem' }}>
                    <label>Process Steps (one per line, optional)</label>
                    <textarea
                      value={processDraft}
                      onChange={(e) => setProcessDraft(e.target.value)}
                      rows="4"
                      placeholder={'Design\nProof\nPrint\nFinish\nDeliver'}
                    />
                    <small>Shows numbered steps on the service page.</small>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Key Message (optional)</label>
                    <textarea
                      name="key_message"
                      value={form.key_message || ''}
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Copy / Tagline (optional)</label>
                    <textarea
                      name="copy"
                      value={form.copy || ''}
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>
                </div>
              )}

              {/* ================= TAB 4: CTA ================= */}
              {activeTab === 'cta' && (
                <div className={styles.tabPane}>
                  <div className={styles.fieldGroup}>
                    <label>CTA Text</label>
                    <input
                      name="cta"
                      value={form.cta || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>CTA Button Label</label>
                    <input
                      name="cta_button"
                      value={form.cta_button || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

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
          {services.map((svc) => {
            const subCount = Array.isArray(svc.sub_services)
              ? svc.sub_services.length
              : 0;
            return (
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
                  {subCount > 0 && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '0.4rem',
                        fontSize: '0.7rem',
                        color: '#ad1380',
                        fontWeight: 700
                      }}
                    >
                      {subCount} child service{subCount !== 1 ? 's' : ''}
                    </span>
                  )}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageServices;