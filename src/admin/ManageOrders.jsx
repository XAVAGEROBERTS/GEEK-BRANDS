// src/admin/ManageOrders.jsx
import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationsContext';
import {
  FaTrash,
  FaEdit,
  FaTimes,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaPenNib
} from 'react-icons/fa';
import { SkeletonTable } from './Loaders';
import styles from './Manage.module.css';

const statusOptions = ['Pending', 'In Production', 'Awaiting Approval', 'Completed', 'Cancelled'];

const ManageOrders = () => {
  const { orders, loadOrders, updateOrder, deleteOrder } = useData();
  const { lastEvent } = useNotifications();

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [viewing, setViewing] = useState(null);       // ✅ new — view modal
  const [artworkView, setArtworkView] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      await loadOrders();
      setLoading(false);
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (lastEvent?.type === 'new_order') {
      loadOrders();
    }
  }, [lastEvent]);

  const openView = (order) => setViewing(order);
  const closeView = () => setViewing(null);

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

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Orders</h1>
          <p>Track and update customer bookings</p>
        </div>
      </div>

      {/* ============================================================
          VIEW MODAL — read-only, all fields
         ============================================================ */}
      {viewing && (
        <div className={styles.modal} onClick={closeView}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={closeView} className={styles.closeBtn}><FaTimes /></button>

            <div className={styles.modalHeader}>
              <h2>Order {viewing.booking_ref || '—'}</h2>
              <p className={styles.modalSubtitle}>
                Submitted {formatDate(viewing.created_at)}
              </p>
            </div>

            <div className={styles.viewGrid}>
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Status</span>
                <span className={`${styles.status} ${styles[viewing.status?.replace(/\s/g, '')] || ''}`}>
                  {viewing.status || '—'}
                </span>
              </div>

              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Progress</span>
                <span className={styles.viewValue}>{viewing.progress || 0}%</span>
              </div>

              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Customer</span>
                <span className={styles.viewValue}>{viewing.customer || '—'}</span>
              </div>

              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Business</span>
                <span className={styles.viewValue}>{viewing.business || '—'}</span>
              </div>

              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Phone</span>
                <span className={styles.viewValue}>{viewing.phone || '—'}</span>
              </div>

              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Email</span>
                <span className={styles.viewValue}>{viewing.email || '—'}</span>
              </div>

              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Service</span>
                <span className={styles.viewValue}>{viewing.service || '—'}</span>
              </div>

              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Quantity</span>
                <span className={styles.viewValue}>{viewing.quantity || '—'}</span>
              </div>

              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Size / Dimensions</span>
                <span className={styles.viewValue}>{viewing.size || '—'}</span>
              </div>

              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Deadline</span>
                <span className={styles.viewValue}>{viewing.deadline || '—'}</span>
              </div>
            </div>

            <div className={styles.viewBlock}>
              <span className={styles.viewLabel}>Project Description</span>
              <p className={styles.viewText}>{viewing.description || '—'}</p>
            </div>

            {viewing.notes && (
              <div className={styles.viewBlock}>
                <span className={styles.viewLabel}>Internal Notes</span>
                <p className={styles.viewText}>{viewing.notes}</p>
              </div>
            )}

            {/* Design for me */}
            {viewing.design_for_me && (
              <div className={styles.designBanner}>
                <FaPenNib />
                <div>
                  <strong>Design for me</strong>
                  <small>The customer asked us to design the artwork.</small>
                </div>
              </div>
            )}

            {/* Artwork */}
            {viewing.artwork_url && (
              <div className={styles.artworkBlock}>
                <span className={styles.viewLabel}>Customer Artwork</span>
                <div className={styles.artworkBtnRow}>
                  <button
                    type="button"
                    onClick={() => openArtwork(viewing)}
                    className={styles.viewArtworkBtn}
                  >
                    <FaFileAlt /> View
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadFile(viewing.artwork_url, `artwork-${viewing.booking_ref || viewing.customer}`)
                    }
                    className={styles.viewArtworkBtn}
                  >
                    <FaDownload /> Download
                  </button>
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={closeView}
                className={styles.cancelBtn}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  closeView();
                  openEdit(viewing);
                }}
                className={styles.submitBtn}
              >
                <FaEdit /> Edit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          EDIT MODAL
         ============================================================ */}
      {editing && (
        <div className={styles.modal} onClick={closeForm}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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

              {form.design_for_me && (
                <div className={styles.designBanner}>
                  <FaPenNib />
                  <div>
                    <strong>Design for me</strong>
                    <small>The customer asked us to design the artwork.</small>
                  </div>
                </div>
              )}

              {form.artwork_url && (
                <div className={styles.artworkBlock}>
                  <label>Customer Artwork</label>
                  <div className={styles.artworkBtnRow}>
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

      {/* ============================================================
          ARTWORK VIEWER MODAL
         ============================================================ */}
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

      {/* ============================================================
          ORDERS LIST
         ============================================================ */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : orders.length === 0 ? (
        <p className={styles.empty}>No orders yet. New orders appear here.</p>
      ) : (
        <>
          {/* ===== DESKTOP / TABLET: TABLE ===== */}
          <div className={styles.tableWrap}>
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
                        <div className={styles.artworkBtnRow}>
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
                      ) : o.design_for_me ? (
                        <span className={styles.designBadge}>
                          <FaPenNib /> Design for me
                        </span>
                      ) : (
                        <span className={styles.noArtwork}>—</span>
                      )}
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => openView(o)}
                        className={styles.viewBtn}
                        title="View details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openEdit(o)}
                        className={styles.editBtn}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className={styles.deleteBtn}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== MOBILE: CARD LIST ===== */}
          <div className={styles.ordersCards}>
            {orders.map((o) => (
              <div key={o.id} className={styles.orderCard}>
                <div className={styles.orderCardHeader}>
                  <div className={styles.orderRefBlock}>
                    <span className={styles.orderRefLabel}>Ref</span>
                    <strong className={styles.orderRef}>
                      {o.booking_ref || '—'}
                    </strong>
                  </div>
                  <span className={`${styles.status} ${styles[o.status?.replace(/\s/g, '')] || ''}`}>
                    {o.status}
                  </span>
                </div>

                <div className={styles.orderCardRow}>
                  <span className={styles.orderCardLabel}>Customer</span>
                  <div className={styles.orderCardValue}>
                    <strong>{o.customer}</strong>
                    {o.phone && <small>{o.phone}</small>}
                  </div>
                </div>

                <div className={styles.orderCardRow}>
                  <span className={styles.orderCardLabel}>Service</span>
                  <span className={styles.orderCardValue}>{o.service || '—'}</span>
                </div>

                <div className={styles.orderCardTwoCols}>
                  <div className={styles.orderCardRow}>
                    <span className={styles.orderCardLabel}>Progress</span>
                    <span className={styles.orderCardValue}>{o.progress || 0}%</span>
                  </div>
                  <div className={styles.orderCardRow}>
                    <span className={styles.orderCardLabel}>Deadline</span>
                    <span className={styles.orderCardValue}>{o.deadline || '—'}</span>
                  </div>
                </div>

                {(o.artwork_url || o.design_for_me) && (
                  <div className={styles.orderCardRow}>
                    <span className={styles.orderCardLabel}>Artwork</span>
                    {o.artwork_url ? (
                      <div className={styles.artworkBtnRow}>
                        <button
                          onClick={() => openArtwork(o)}
                          className={styles.artworkBtn}
                        >
                          {isImage(o.artwork_url) ? '🖼️ View' : '📄 Open'}
                        </button>
                        <button
                          onClick={() =>
                            downloadFile(o.artwork_url, `artwork-${o.booking_ref || o.customer}`)
                          }
                          className={styles.artworkBtn}
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    ) : (
                      <span className={styles.designBadge}>
                        <FaPenNib /> Design for me
                      </span>
                    )}
                  </div>
                )}

                {/* ✅ Three actions on mobile */}
                <div className={styles.orderCardActions}>
                  <button
                    onClick={() => openView(o)}
                    className={styles.orderCardViewBtn}
                  >
                    <FaEye /> View
                  </button>
                  <button
                    onClick={() => openEdit(o)}
                    className={styles.orderCardEditBtn}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(o.id)}
                    className={styles.orderCardDeleteBtn}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ManageOrders;