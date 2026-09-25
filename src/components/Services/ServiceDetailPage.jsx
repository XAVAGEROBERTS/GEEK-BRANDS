// src/components/Services/ServiceDetailPage.jsx
import React, { useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import styles from './ServiceDetailPage.module.css';

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { services = [], loading } = useData();

  // Scroll to top when opening a service detail
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Clear state so browser back/refresh doesn't keep re-triggering oddly
    if (location.state?.scrollToTop) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [slug]); // re-run when switching between services

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
          <Link to="/services" className="btn-primary">
            View All Services
          </Link>
        </div>
      </section>
    );
  }

  const subServices = Array.isArray(service.sub_services)
    ? service.sub_services.filter((s) => s && (s.image_url || s.title))
    : [];

  return (
    <section className={styles.serviceDetail}>
      <div className={styles.serviceHero}>
        <div className={styles.heroInner}>
          <div className={styles.heroImageWrap}>
            <img
              src={service.image_url}
              alt={service.title}
              loading="eager"
            />
          </div>

          <div className={styles.heroText}>
            <span className={styles.heroBadge}>Our Service</span>
            <h1>{service.title}</h1>
            <p>
              {service.short_description ||
                service.hero_subheading ||
                'Professionally crafted for your brand.'}
            </p>
            <Link to="/order" className={styles.heroCta}>
              {service.cta_button || 'Make Your Order'}
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        {subServices.length > 0 && (
          <div className={styles.subServicesSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>What We Offer</span>
              <h2>Explore Our {service.title}</h2>
              <p>Choose the option that fits your project</p>
            </div>

            <div className={styles.subServicesGrid}>
              {subServices.map((sub, index) => (
                <div key={index} className={styles.subServiceCard}>
                  {sub.image_url && (
                    <div className={styles.subServiceImage}>
                      <img
                        src={sub.image_url}
                        alt={sub.title || `Sub-service ${index + 1}`}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className={styles.subServiceInfo}>
                    {sub.title && (
                      <h3 className={styles.subServiceTitle}>{sub.title}</h3>
                    )}
                    {sub.description && (
                      <p className={styles.subServiceDesc}>{sub.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {subServices.length === 0 && (
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
                <Link to="/order" className="btn-primary">
                  {service.cta || 'Make Your Order'}
                </Link>
              </div>
            </div>
          </div>
        )}

        {subServices.length > 0 && (
          <div className={styles.bottomCta}>
            <h3>Ready to get started?</h3>
            <p>Let's bring your vision to life.</p>
            <Link to="/order" className="btn-primary">
              {service.cta || 'Make Your Order'}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServiceDetailPage;