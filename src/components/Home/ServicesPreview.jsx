// src/components/Home/ServicesPreview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import styles from './ServicesPreview.module.css';

const ServicesPreview = () => {
  const { services = [], loading } = useData();
  const previewServices = services.slice(0, 6);

  return (
    <section className={`container ${styles.servicesPreview}`}>
      <div className="section-title">
        <span className="badge">What We Do</span>
        <h2>Our Services</h2>
        <p>Professional branding and printing solutions for your business</p>
      </div>

      {loading ? (
        <p className={styles.empty}>Loading services...</p>
      ) : (
        <div className={styles.servicesGrid}>
          {previewServices.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.slug}`}
              className={styles.serviceCardLink}
            >
              <div className={styles.serviceCard}>
                <div
                  className={styles.serviceIcon}
                  style={{ background: service.color }}
                >
                  <span>{service.icon}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.short_description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className={styles.viewAll}>
        <Link to="/services" className="btn-primary">View All Services</Link>
      </div>
    </section>
  );
};

export default ServicesPreview;