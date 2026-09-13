// src/components/Services/ServicesPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import styles from './ServicesPage.module.css';

const ServicesPage = () => {
  const { services = [], loading } = useData();

  return (
    <section className="container">
      <div className={styles.servicesPage}>
        <div className="section-title">
          <span className="badge">Our Expertise</span>
          <h2>Complete Branding & Printing Services</h2>
          <p>From concept to creation, we handle all your branding needs</p>
        </div>

        {loading && <p className={styles.empty}>Loading services...</p>}

        {!loading && services.length === 0 && (
          <p className={styles.empty}>No services available yet.</p>
        )}

        {!loading && services.length > 0 && (
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className={styles.serviceCardLink}
              >
                <div className={styles.serviceCard}>
                  <div className={styles.serviceImage}>
                    <img
                      src={service.image_url}
                      alt={service.title}
                      loading="lazy"
                    />
                  </div>

                  <h3>{service.title}</h3>
                  <p>{service.short_description}</p>
                  <ul className={styles.serviceFeatures}>
                    <li>✓ Professional execution</li>
                    <li>✓ Premium materials</li>
                    <li>✓ On-time delivery</li>
                  </ul>
                  <span className={styles.learnMore}>Learn more →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesPage;