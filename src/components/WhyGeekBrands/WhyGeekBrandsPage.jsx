// src/components/WhyGeekBrands/WhyGeekBrandsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './WhyGeekBrandsPage.module.css';

const WhyGeekBrandsPage = () => {
  const reasons = [
    {
      title: 'Creative thinking',
      description: 'We approach every project with an eye for presentation.',
      icon: '💡'
    },
    {
      title: 'Professional execution',
      description: 'Your brand should look professional wherever it appears.',
      icon: '⭐'
    },
    {
      title: 'Attention to detail',
      description: 'Small details can make a big difference.',
      icon: '🔎'
    },
    {
      title: 'Flexible solutions',
      description: 'Different businesses need different branding solutions.',
      icon: '🔄'
    },
    {
      title: 'Fast communication',
      description: "We keep the process clear so you know what's happening.",
      icon: '💬'
    },
    {
      title: 'Branding that works',
      description: 'Beautiful design is great. Branding that helps your business get noticed is better.',
      icon: '🚀'
    }
  ];

  return (
    <section className="container">
      <div className={styles.whyPage}>
        <div className="section-title">
          <span className="badge">Why Geek Brands</span>
          <h2>Because "good enough" isn't really our thing.</h2>
          <p>Here's what sets us apart from the rest</p>
        </div>

        <div className={styles.reasonsGrid}>
          {reasons.map((reason, index) => (
            <div key={index} className={styles.reasonCard}>
              <div className={styles.reasonIcon}>{reason.icon}</div>
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.whyCta}>
          <h3>Ready to experience the Geek Brands difference?</h3>
          <Link to="/order" className="btn-primary">Make Your Order</Link>
        </div>
      </div>
    </section>
  );
};

export default WhyGeekBrandsPage;