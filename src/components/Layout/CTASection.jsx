// src/components/Layout/CTASection.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCalendarCheck } from 'react-icons/fa';
import styles from './CTASection.module.css';

const CAL_URL = 'https://cal.com/geek-brands-ug';

const CTASection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleOrderClick = (e) => {
    e.preventDefault();

    if (location.pathname === '/order') {
      // Already on order page → scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Navigate and tell OrderPage to scroll to top after mount
    navigate('/order', { state: { scrollToTop: true } });
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