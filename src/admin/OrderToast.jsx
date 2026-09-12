// src/admin/OrderToast.jsx
import React, { useEffect, useState } from 'react';
import { FaBell, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import styles from './OrderToast.module.css';

const OrderToast = ({ title, message, orderRef, onClose, onView }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const duration = 6000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <div className={styles.toastWrap}>
      <div className={styles.toast}>
        <div className={styles.iconWrap}>
          <FaBell />
        </div>

        <div className={styles.content}>
          <strong className={styles.title}>{title}</strong>
          <p className={styles.message}>{message}</p>
          {orderRef && <span className={styles.ref}>{orderRef}</span>}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.viewBtn}
            onClick={onView}
            title="View Orders"
          >
            <FaExternalLinkAlt />
          </button>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderToast;