// src/components/Home/WhatsAppFloat.jsx
import React, { useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import styles from './WhatsAppFloat.module.css';
import logoImage from '../../assets/images/PROFILE.png';

const WhatsAppFloat = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { settings, loading } = useData();

  // Don't render until settings load
  if (loading || !settings) return null;

  const phoneNumber = settings.whatsapp_number || '256743040345';
  const defaultMessage =
    settings.whatsapp_message ||
    "Hello Geek Brands! I'd like to enquire about your services.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className={styles.whatsappWrapper}>
      {showTooltip && (
        <div className={styles.tooltip}>
          <button
            className={styles.closeTooltip}
            onClick={() => setShowTooltip(false)}
            aria-label="Close"
          >
            <FaTimes />
          </button>

          <div className={styles.tooltipHeader}>
            <img
              src={logoImage}
              alt="Geek Brands"
              className={styles.avatar}
            />
            <div>
              <strong>Geek Brands</strong>
              <span className={styles.online}>● Online now</span>
            </div>
          </div>

          <p className={styles.tooltipMessage}>
            Hi there! 👋 Need help with branding or printing? Chat with us on WhatsApp.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.chatBtn}
          >
            Start Chat
          </a>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappBtn}
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onFocus={() => setShowTooltip(true)}
      >
        <FaWhatsapp />
        <span className={styles.pulseRing} />
      </a>
    </div>
  );
};

export default WhatsAppFloat;