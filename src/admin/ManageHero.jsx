// src/admin/ManageHero.jsx
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { FaTrash, FaEdit, FaPlus, FaTimes } from 'react-icons/fa';
import { SkeletonList } from './Loaders';
import styles from './Manage.module.css';

const emptySlide = {
  heading: '',
  image: '',
  cta1: 'Make Your Order',
  cta1_link: '/order',
  cta2: 'Explore Our Services',
  cta2_link: '/services',
  text_align: 'left',
  show_text: true,
  sort_order: 0
};

const ManageHero = () => {
  const {
    heroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    uploadImage,
    loading
  } = useData();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySlide);
  const [uploading, setUploading] = useState(false);

  const openNew = () => {
    setEditing('new');
    setForm({ ...emptySlide, sort_order: heroSlides.length });
  };

  const openEdit = (slide) => {
    setEditing(slide.id);
    setForm({ ...emptySlide, ...slide });
  };

  const closeForm = () => {
    setEditing(null);
    setForm(emptySlide);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { url, error } = await uploadImage(file, 'hero');
    setUploading(false);
    if (error) {
      alert('Upload failed: ' + error.message);
      return;
    }
    setForm((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      alert('Please add an image (upload or paste a URL).');
      return;
    }

    if (editing === 'new') {
      const { error } = await addHeroSlide(form);
      if (error) alert('Failed to add: ' + error.message);
    } else {
      const { error } = await updateHeroSlide(editing, form);
      if (error) alert('Failed to update: ' + error.message);
    }
    closeForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    const { error } = await deleteHeroSlide(id);
    if (error) alert('Delete failed: ' + error.message);
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Hero Slides</h1>
          <p>Manage the rotating banner at the top of your homepage</p>
        </div>
        <button onClick={openNew} className={styles.addBtn}>
          <FaPlus /> Add Slide
        </button>
      </div>

      {/* Form Modal */}
      {editing && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button onClick={closeForm} className={styles.closeBtn}>
              <FaTimes />
            </button>
            <h2>{editing === 'new' ? 'New Slide' : 'Edit Slide'}</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              <label>Heading (supports HTML)</label>
              <input
                name="heading"
                value={form.heading}
                onChange={handleChange}
                required
                placeholder='Your products deserve to <span class="highlight">stand out</span>.'
              />
              <small style={{ fontSize: '0.75rem', color: '#888', marginTop: '-0.3rem' }}>
                Use <code>&lt;span class="highlight"&gt;word&lt;/span&gt;</code> to color a word pink.
              </small>

              <label>Image URL</label>
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
              />

              <label>Or Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {uploading && <p>Uploading...</p>}
              {form.image && (
                <img src={form.image} alt="preview" className={styles.preview} />
              )}

              <div className={styles.row}>
                <div>
                  <label>CTA 1 Text</label>
                  <input name="cta1" value={form.cta1} onChange={handleChange} />
                </div>
                <div>
                  <label>CTA 1 Link</label>
                  <input name="cta1_link" value={form.cta1_link} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.row}>
                <div>
                  <label>CTA 2 Text</label>
                  <input name="cta2" value={form.cta2} onChange={handleChange} />
                </div>
                <div>
                  <label>CTA 2 Link</label>
                  <input name="cta2_link" value={form.cta2_link} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.row}>
                <div>
                  <label>Text Align</label>
                  <select name="text_align" value={form.text_align} onChange={handleChange}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label>Sort Order</label>
                  <input
                    name="sort_order"
                    type="number"
                    value={form.sort_order}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                {editing === 'new' ? 'Create Slide' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Slides List */}
      {loading ? (
        <SkeletonList rows={4} />
      ) : (
        <div className={styles.list}>
          {heroSlides.length === 0 && (
            <p className={styles.empty}>
              No hero slides yet. Click "Add Slide" to create one.
            </p>
          )}
          {heroSlides.map((slide) => (
            <div key={slide.id} className={styles.item}>
              <img src={slide.image} alt="slide" className={styles.thumb} />
              <div className={styles.info}>
                <h3 dangerouslySetInnerHTML={{ __html: slide.heading || '—' }} />
                <p className={styles.badge}>{slide.text_align || 'left'} · order {slide.sort_order ?? 0}</p>
              </div>
              <div className={styles.actions}>
                <button onClick={() => openEdit(slide)} className={styles.editBtn}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(slide.id)} className={styles.deleteBtn}>
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

export default ManageHero;