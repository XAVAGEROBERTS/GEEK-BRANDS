// src/components/Services/ServiceDetailPage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import styles from './ServiceDetailPage.module.css';

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const { services = [], loading } = useData();

  if (loading) {
    return (
      <section className="container">
        <div className={styles.notFound}>
          <h2>Loading service...</h2>
        </div>
      </section>
    );
  }

  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <section className="container">
        <div className={styles.notFound}>
          <h2>Service not found</h2>
          <Link to="/services" className="btn-primary">View All Services</Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.serviceDetail}>
      <div
        className={styles.serviceHero}
        style={{
          background: `linear-gradient(135deg, ${service.color}22, ${service.color}44)`
        }}
      >
        <div className="container">
          <span className={styles.serviceIcon}>{service.icon}</span>
          <h1>{service.hero_heading}</h1>
          <p>{service.hero_subheading}</p>
          <Link to="/order" className="btn-primary">{service.cta_button}</Link>
        </div>
      </div>

      <div className="container">
        <div className={styles.serviceBody}>
          <div className={styles.serviceMain}>
            <h2>What We Offer</h2>
            <p>{service.description}</p>

            {service.services_list?.length > 0 && (
              <>
                <h3>Our Services Include:</h3>
                <ul className={styles.serviceList}>
                  {service.services_list.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </>
            )}

            {service.process?.length > 0 && (
              <>
                <h3>Our Process</h3>
                <div className={styles.processSteps}>
                  {service.process.map((step, index) => (
                    <div key={index} className={styles.processStep}>
                      <span>{index + 1}</span>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {service.key_message && (
              <div className={styles.keyMessage}>
                <p>{service.key_message}</p>
              </div>
            )}

            {service.copy && (
              <div className={styles.serviceCopy}>
                <p>{service.copy}</p>
              </div>
            )}
          </div>

          <div className={styles.serviceSidebar}>
            <div className={styles.ctaCard}>
              <h3>Ready to get started?</h3>
              <p>Let's bring your vision to life.</p>
              <Link to="/order" className="btn-primary">{service.cta}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceDetailPage;