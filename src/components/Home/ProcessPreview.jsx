// src/components/Home/ProcessPreview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProcessPreview.module.css';

const ProcessPreview = () => {
  const steps = [
    { step: 1, title: 'Tell us what you need', icon: '📝' },
    { step: 2, title: 'We understand your project', icon: '🔍' },
    { step: 3, title: 'Design & approval', icon: '🎨' },
    { step: 4, title: 'Production', icon: '🖨️' },
    { step: 5, title: 'Quality check', icon: '✅' },
    { step: 6, title: 'Delivery / Collection', icon: '🚚' }
  ];

  return (
    <section className={`container ${styles.processPreview}`}>
      <div className="section-title">
        <span className="badge">How It Works</span>
        <h2>From "I have an idea" to "Damn, that looks good."</h2>
        <p>Six simple steps to bring your brand to life</p>
      </div>

      <div className={styles.stepsGrid}>
        {steps.map((step) => (
          <div key={step.step} className={styles.stepCard}>
            <div className={styles.stepIcon}>{step.icon}</div>
            <span className={styles.stepNumber}>Step {step.step}</span>
            <h3>{step.title}</h3>
          </div>
        ))}
      </div>

      <div className={styles.processCta}>
        <Link to="/how-it-works" className="btn-outline">Learn More</Link>
        <Link to="/order" className="btn-primary">Make Your Order</Link>
      </div>
    </section>
  );
};

export default ProcessPreview;