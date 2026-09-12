// src/admin/ManagePortfolio.jsx
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { FaTrash, FaEdit, FaPlus, FaTimes } from 'react-icons/fa';
import { SkeletonList } from './Loaders';
import styles from './Manage.module.css';

const emptyItem = {
  name: '',
  category: 'product',
  service: '',
  client: '',
  description: '',
  image: '',
  sort_order: 0
};

const categories = [
  { value: 'product', label: 'Product Branding' },
  { value: 'vehicle', label: 'Vehicle Branding' },
  { value: 'signage', label: 'Signages' },
  { value: 'largeformat', label: 'Large Format' },
  { value: 'marketing', label: 'Marketing Materials' },
  { value: 'school', label: 'School & Learning' },
  { value: 'corporate', label: 'Corporate Branding' }
];

const ManagePortfolio = () => {
  const {
    portfolio,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    uploadImage,
    loading
  } = useData();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyItem);
  const [uploading, setUploading] = useState(false);

  const openNew = () => {
    setEditing('new');
    setForm({ ...emptyItem, sort_order: portfolio.length });
  };

  const openEdit = (item) => {
    setEditing(item.id);
    setForm({ ...item });
  };

  const closeForm = () => {
    setEditing(null);
    setForm(emptyItem);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { url, error } = await uploadImage(file, 'portfolio');
    setUploading(false);
    if (error) return alert('Upload failed: ' + error.message);
    setForm((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return alert('Image is required.');

    if (editing === 'new') {
      const { error } = await addPortfolioItem(form);
      if (error) alert('Failed: ' + error.message);
    } else {
      const { error } = await updatePortfolioItem(editing, form);
      if (error) alert('Failed: ' + error.message);
    }
    closeForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    const { error } = await deletePortfolioItem(id);
    if (error) alert('Delete failed: ' + error.message);
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Portfolio</h1>
          <p>Manage your work showcase</p>
        </div>
        <button onClick={openNew} className={styles.addBtn}>
          <FaPlus /> Add Item
        </button>
      </div>

      {editing && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button onClick={closeForm} className={styles.closeBtn}>
              <FaTimes />
            </button>
            <h2>{editing === 'new' ? 'New Portfolio Item' : 'Edit Item'}</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              <label>Project Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />

              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              <label>Service Provided</label>
              <input name="service" value={form.service} onChange={handleChange} />

              <label>Client</label>
              <input name="client" value={form.client} onChange={handleChange} />

              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
              />

              <label>Image URL</label>
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />

              <label>Or Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {uploading && <p>Uploading...</p>}
              {form.image && <img src={form.image} alt="preview" className={styles.preview} />}

              <label>Sort Order</label>
              <input
                name="sort_order"
                type="number"
                value={form.sort_order}
                onChange={handleChange}
              />

              <button type="submit" className={styles.submitBtn}>
                {editing === 'new' ? 'Create Item' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonList rows={4} />
      ) : (
        <div className={styles.list}>
          {portfolio.length === 0 && <p className={styles.empty}>No portfolio items yet.</p>}
          {portfolio.map((item) => (
            <div key={item.id} className={styles.item}>
              <img src={item.image} alt={item.name} className={styles.thumb} />
              <div className={styles.info}>
                <h3>{item.name}</h3>
                <span className={styles.badge}>{item.category}</span>
                <p>{item.client}</p>
              </div>
              <div className={styles.actions}>
                <button onClick={() => openEdit(item)} className={styles.editBtn}><FaEdit /></button>
                <button onClick={() => handleDelete(item.id)} className={styles.deleteBtn}><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagePortfolio;