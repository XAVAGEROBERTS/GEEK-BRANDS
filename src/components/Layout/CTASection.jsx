// src/components/Layout/CTASection.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCalendarCheck } from 'react-icons/fa';
import styles from './CTASection.module.css';

const CAL_URL = 'https://cal.com/geek-brands-ug';

// Scroll target — the form wrapper inside OrderPage
const ORDER_ANCHOR = 'order-form';

// Small delay to let the page mount before we scroll
const SCROLL_DELAY = 120;

const CTASection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToOrderForm = () => {
    // Wait for the page to render, then scroll the form into view
    setTimeout(() => {
      const el = document.getElementById(ORDER_ANCHOR);
      if (el) {
        const headerOffset = 90; // accounts for sticky header height
        const rect = el.getBoundingClientRect();
        const top = window.scrollY + rect.top - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, SCROLL_DELAY);
  };

  const handleOrderClick = (e) => {
    e.preventDefault();

    if (location.pathname === '/order') {
      // Already on the order page — just scroll
      scrollToOrderForm();
      return;
    }

    // Navigate first, then scroll to the form
    navigate('/order');
    scrollToOrderForm();
  };

  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaInner}>
          <div className={styles.ctaText}>
            <h2>
              Ready to make your <span>brand</span> look?
            </h2>
            <p>
              Your competitors are already branding. Don't let them have all
              the fun.
            </p>
          </div>

          <div className={styles.ctaActions}>
            <a
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.bookBtn}
            >
              <FaCalendarCheck />
              Book a Phone Call Consultation
            </a>

            <Link
              to="/order"
              className={styles.orderBtn}
              onClick={handleOrderClick}
            >
              Make Your Order
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;