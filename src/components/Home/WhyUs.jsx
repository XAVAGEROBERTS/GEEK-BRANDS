// src/components/Home/WhyUs.jsx
import React from 'react';
import styles from './WhyUs.module.css';

const WhyUs = () => {
  const features = [
    {
      icon: '🎯',
      title: 'We understand branding.',
      description: "We don't just put your logo on something. We think about how your brand should look and feel."
    },
    {
      icon: '✨',
      title: 'We care about quality.',
      description: 'Good printing is more than ink and paper. Finishing, clarity, colour and presentation matter.'
    },
    {
      icon: '🚀',
      title: 'We keep things moving.',
      description: "When you need your branding, you don't want excuses. You want progress."
    },
    {
      icon: '🤝',
      title: 'We make it easy.',
      description: "Tell us what you need. Share your idea. We'll help you figure out the rest."
    }
  ];

  return (
    <section className={styles.whyUs}>
      <div className="container">
        <div className="section-title">
          <span className="badge">Why Choose Us</span>
          <h2>Why Geek Brands?</h2>
          <p>Here's what makes us different</p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;