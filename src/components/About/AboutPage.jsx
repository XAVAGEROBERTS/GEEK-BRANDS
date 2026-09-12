// src/components/About/AboutPage.jsx - UPDATED
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  const values = [
    { title: 'Creativity', description: "We don't believe branding should be boring.", icon: '🎨' },
    { title: 'Quality', description: 'We pay attention to the details that make the final product better.', icon: '⭐' },
    { title: 'Reliability', description: 'You should know what to expect when you work with us.', icon: '🤝' },
    { title: 'Professionalism', description: 'We take your brand as seriously as you do.', icon: '💼' },
    { title: 'Customer-focused service', description: "Your project isn't just another job number.", icon: '❤️' }
  ];

  return (
    <section className="container">
      <div className={styles.aboutPage}>
        {/* Hero */}
        <div className="section-title">
          <span className="badge">About Us</span>
          <h2>We're Geek Brands. We make businesses look good.</h2>
          <p>Geek Brands is a creative branding, printing and design company focused on helping businesses and organizations present themselves professionally.</p>
        </div>

        {/* Our Story */}
        <div className={styles.aboutSection}>
          <h2>Our Story</h2>
          <h3>Built around one simple idea: your brand matters.</h3>
          <p>Every business has a story. Sometimes that story is on a product label. Sometimes it's on a vehicle. Sometimes it's on a sign outside a shop. Sometimes it's on a school chart hanging on a classroom wall.</p>
          <p>Whatever the format, we believe that good branding communicates before you even say a word.</p>
          <p>That's why we focus on creating branding that is clear, attractive, professional and memorable.</p>
        </div>

        {/* Mission & Vision */}
        <div className={styles.missionVision}>
          <div className={styles.missionCard}>
            <h3>Our Mission</h3>
            <p>To make quality branding accessible, practical and memorable.</p>
            <p>We want businesses to have access to professional-looking branding without making the process complicated.</p>
          </div>
          <div className={styles.visionCard}>
            <h3>Our Vision</h3>
            <p>To become a trusted creative branding and printing partner for businesses and organizations.</p>
          </div>
        </div>

        {/* Values */}
        <div className={styles.valuesSection}>
          <h2>Our Values</h2>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <div key={index} className={styles.valueCard}>
                <span className={styles.valueIcon}>{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className={styles.aboutCta}>
          <h3>Ready to work with us?</h3>
          <Link to="/order" className="btn-primary">Make Your Order</Link>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;