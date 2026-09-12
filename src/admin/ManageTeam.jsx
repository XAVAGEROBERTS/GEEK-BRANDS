// src/admin/ManageTeam.jsx
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { FaTrash, FaEdit, FaPlus, FaTimes } from 'react-icons/fa';
import { SkeletonList } from './Loaders';
import styles from './Manage.module.css';

const emptyMember = {
  name: '',
  position: '',
  bio: '',
  image: '',
  sort_order: 0
};

const ManageTeam = () => {
  const {
    team,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    uploadImage,
    loading
  } = useData();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyMember);
  const [uploading, setUploading] = useState(false);

  const openNew = () => {
    setEditing('new');
    setForm({ ...emptyMember, sort_order: team.length });
  };

  const openEdit = (m) => {
    setEditing(m.id);
    setForm({ ...m });
  };

  const closeForm = () => {
    setEditing(null);
    setForm(emptyMember);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { url, error } = await uploadImage(file, 'team');
    setUploading(false);
    if (error) return alert('Upload failed: ' + error.message);
    setForm((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing === 'new') {
      const { error } = await addTeamMember(form);
      if (error) alert('Failed: ' + error.message);
    } else {
      const { error } = await updateTeamMember(editing, form);
      if (error) alert('Failed: ' + error.message);
    }
    closeForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    const { error } = await deleteTeamMember(id);
    if (error) alert('Delete failed: ' + error.message);
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Team Members</h1>
          <p>Add, edit, or remove team members</p>
        </div>
        <button onClick={openNew} className={styles.addBtn}>
          <FaPlus /> Add Member
        </button>
      </div>

      {editing && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button onClick={closeForm} className={styles.closeBtn}><FaTimes /></button>
            <h2>{editing === 'new' ? 'New Team Member' : 'Edit Member'}</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />

              <label>Position</label>
              <input name="position" value={form.position} onChange={handleChange} required />

              <label>Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows="3" />

              <label>Photo URL</label>
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />

              <label>Or Upload Photo</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {uploading && <p>Uploading...</p>}
              {form.image && <img src={form.image} alt="preview" className={styles.previewRound} />}

              <label>Sort Order</label>
              <input
                name="sort_order"
                type="number"
                value={form.sort_order}
                onChange={handleChange}
              />

              <button type="submit" className={styles.submitBtn}>
                {editing === 'new' ? 'Add Member' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonList rows={4} variant="round" />
      ) : (
        <div className={styles.list}>
          {team.length === 0 && <p className={styles.empty}>No team members yet.</p>}
          {team.map((m) => (
            <div key={m.id} className={styles.item}>
              <img src={m.image} alt={m.name} className={styles.thumbRound} />
              <div className={styles.info}>
                <h3>{m.name}</h3>
                <span className={styles.badge}>{m.position}</span>
                <p>{m.bio}</p>
              </div>
              <div className={styles.actions}>
                <button onClick={() => openEdit(m)} className={styles.editBtn}><FaEdit /></button>
                <button onClick={() => handleDelete(m.id)} className={styles.deleteBtn}><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTeam;