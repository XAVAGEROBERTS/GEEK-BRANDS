// src/admin/ManageOrders.jsx
import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationsContext';
import { FaTrash, FaEdit, FaTimes, FaFileAlt, FaDownload } from 'react-icons/fa';
import { SkeletonTable } from './Loaders';
import styles from './Manage.module.css';

const statusOptions = ['Pending', 'In Production', 'Awaiting Approval', 'Completed', 'Cancelled'];

const ManageOrders = () => {
  const { orders, loadOrders, updateOrder, deleteOrder } = useData();
  const { lastEvent } = useNotifications();

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [artworkView, setArtworkView] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      await loadOrders();
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // ===== AUTO-REFRESH WHEN NEW ORDER ARRIVES =====
  useEffect(() => {
    if (lastEvent?.type === 'new_order') {
      // Refresh the orders list without showing the skeleton
      loadOrders();
    }
  }, [lastEvent]);

  const openEdit = (order) => {
    setEditing(order.id);
    setForm({ ...order });
  };

  const closeForm = () => {
    setEditing(null);
    setForm({});
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await updateOrder(editing, {
      status: form.status,
      progress: Number(form.progress),
      notes: form.notes,
      deadline: form.deadline
    });
    if (error) alert('Failed: ' + error.message);
    closeForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    const { error } = await deleteOrder(id);
    if (error) alert('Delete failed: ' + error.message);
  };

  const openArtwork = (order) => {
    setArtworkView({
      url: order.artwork_url,
      name: order.customer || 'Artwork'
    });
  };

  const closeArtwork = () => setArtworkView(null);

  // ===== REAL DOWNLOAD — saves to Downloads folder =====
  const downloadFile = async (url, filename) => {
    if (!url) return alert('No file URL provided.');

    const cleanName = (filename || 'artwork')
      .replace(/[^a-z0-9_\-\.]/gi, '_')
      .replace(/\.{2,}/g, '.');

    const urlFileName = url.split('?')[0].split('/').pop() || '';
    const ext = urlFileName.includes('.')
      ? urlFileName.split('.').pop().toLowerCase()
      : 'jpg';

    const finalName = cleanName.toLowerCase().endsWith(`.${ext}`)
      ? cleanName
      : `${cleanName}.${ext}`;

    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const forcedBlob = new Blob([blob], { type: 'application/octet-stream' });
      const objectUrl = URL.createObjectURL(forcedBlob);

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = finalName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 500);
    } catch (err) {
      console.error('Download failed:', err);
      const fallbackUrl = `${url}${url.includes('?') ? '&' : '?'}download=${encodeURIComponent(finalName)}`;
      const a = document.createElement('a');
      a.href = fallbackUrl;
      a.download = finalName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const isImage = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(url);
  };

  const isPdf = (url) => {
    if (!url) return false;
    return /\.pdf(\?.*)?$/i.test(url);
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Orders</h1>
          <p>Track and update customer bookings</p>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button onClick={closeForm} className={styles.closeBtn}><FaTimes /></button>
            <h2>Update Order {form.booking_ref || form.customer}</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              <label>Status</label>
              <select name="status" value={form.status || ''} onChange={handleChange}>
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <label>Progress (%)</label>
              <input
                name="progress"
                type="number"
                min="0"
                max="100"
                value={form.progress || 0}
                onChange={handleChange}
              />

              <label>Deadline</label>
              <input name="deadline" type="date" value={form.deadline || ''} onChange={handleChange} />

              <label>Notes</label>
              <textarea name="notes" value={form.notes || ''} onChange={handleChange} rows="3" />

              {form.artwork_url && (
                <div className={styles.artworkBlock}>
                  <label>Customer Artwork</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => openArtwork(form)}
                      className={styles.viewArtworkBtn}
                    >
                      <FaFileAlt /> View
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadFile(form.artwork_url, `artwork-${form.booking_ref || form.customer}`)
                      }
                      className={styles.viewArtworkBtn}
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className={styles.submitBtn}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* ARTWORK VIEWER MODAL */}
      {artworkView && (
        <div className={styles.modal} onClick={closeArtwork}>
          <div className={styles.artworkModal} onClick={(e) => e.stopPropagation()}>
            <button onClick={closeArtwork} className={styles.closeBtn}><FaTimes /></button>
            <h2>Artwork — {artworkView.name}</h2>

            <div className={styles.artworkPreview}>
              {isImage(artworkView.url) ? (
                <img src={artworkView.url} alt="Artwork" />
              ) : isPdf(artworkView.url) ? (
                <iframe src={artworkView.url} title="Artwork PDF" className={styles.pdfFrame} />
              ) : (
                <div className={styles.unknownFile}>
                  <FaFileAlt />
                  <p>Preview not available for this file type.</p>
                </div>
              )}
            </div>

            <div className={styles.artworkActions}>
              <a
                href={artworkView.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.downloadBtnOutline}
              >
                Open in New Tab
              </a>
              <button
                type="button"
                onClick={() => downloadFile(artworkView.url, `artwork-${artworkView.name}`)}
                className={styles.downloadBtn}
              >
                <FaDownload /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TABLE */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : (
        <div className={styles.tableWrap}>
          {orders.length === 0 ? (
            <p className={styles.empty}>No orders yet. New orders appear here.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Deadline</th>
                  <th>Artwork</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.booking_ref || '—'}</td>
                    <td>
                      <strong>{o.customer}</strong>
                      <br />
                      <small>{o.phone}</small>
                    </td>
                    <td>{o.service || '—'}</td>
                    <td>
                      <span className={`${styles.status} ${styles[o.status?.replace(/\s/g, '')] || ''}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>{o.progress || 0}%</td>
                    <td>{o.deadline || '—'}</td>
                    <td>
                      {o.artwork_url ? (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openArtwork(o)}
                            className={styles.artworkBtn}
                            title="View artwork"
                          >
                            {isImage(o.artwork_url) ? '🖼️ View' : '📄 Open'}
                          </button>
                          <button
                            onClick={() =>
                              downloadFile(o.artwork_url, `artwork-${o.booking_ref || o.customer}`)
                            }
                            className={styles.artworkBtn}
                            title="Download"
                          >
                            ⬇️
                          </button>
                        </div>
                      ) : (
                        <span className={styles.noArtwork}>—</span>
                      )}
                    </td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => openEdit(o)} className={styles.editBtn}><FaEdit /></button>
                      <button onClick={() => handleDelete(o.id)} className={styles.deleteBtn}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;