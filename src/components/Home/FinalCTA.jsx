// src/components/Home/FinalCTA.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './FinalCTA.module.css';

const FinalCTA = () => {
  return (
    <section className={styles.finalCta}>
      <div className="container">
        <div className={styles.ctaContent}>
          <h2>Ready to make your brand look?</h2>
          <p>Your competitors are already branding. Don't let them have all the fun.</p>
          <Link to="/order" className="btn-primary">Make Your Order</Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;