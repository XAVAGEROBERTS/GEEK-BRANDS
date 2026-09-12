// src/components/HowItWorks/HowItWorksPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HowItWorksPage.module.css';

const HowItWorksPage = () => {
  const steps = [
    {
      step: 1,
      title: 'Tell us what you need',
      description: 'Send us your idea, artwork, logo, measurements or reference.',
      icon: '📝'
    },
    {
      step: 2,
      title: 'We understand your project',
      description: "We'll confirm the specifications, quantity, materials and requirements.",
      icon: '🔍'
    },
    {
      step: 3,
      title: 'Design & approval',
      description: 'If design is required, we prepare the artwork and send it for approval.',
      icon: '🎨'
    },
    {
      step: 4,
      title: 'Production',
      description: 'Once approved, we print, brand or produce your order.',
      icon: '🖨️'
    },
    {
      step: 5,
      title: 'Quality check',
      description: 'We check the finished work before handover.',
      icon: '✅'
    },
    {
      step: 6,
      title: 'Delivery / Collection',
      description: 'Get your completed order and put your brand to work.',
      icon: '🚚'
    }
  ];

  return (
    <section className="container">
      <div className={styles.howItWorksPage}>
        <div className="section-title">
          <span className="badge">Our Process</span>
          <h2>From "I have an idea" to "Damn, that looks good."</h2>
          <p>Six simple steps to bring your brand to life</p>
        </div>

        <div className={styles.stepsContainer}>
          {steps.map((step, index) => (
            <div key={step.step} className={styles.stepCard}>
              <div className={styles.stepNumber}>{step.step}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < steps.length - 1 && <div className={styles.connector} />}
            </div>
          ))}
        </div>

        <div className={styles.processCta}>
          <h3>Ready? Let's skip to Step 1.</h3>
          <Link to="/order" className="btn-primary">Make Your Order</Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksPage;