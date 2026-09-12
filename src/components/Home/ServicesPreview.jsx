// src/components/Home/ServicesPreview.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import styles from './ServicesPreview.module.css';

const AUTO_ADVANCE_MS = 4500;
const CARD_GAP_PX = 24; // must match CSS `gap: 1.5rem`

const ServicesPreview = () => {
  const { services = [], loading } = useData();
  const trackRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [manualPauseUntil, setManualPauseUntil] = useState(0);

  const totalSlides = services.length;

  // ===== HOW MANY CARDS FIT IN VIEW =====
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setVisibleCount(3);
      else if (w >= 640) setVisibleCount(2);
      else setVisibleCount(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, totalSlides - visibleCount);

  // ===== CLAMP INDEX WHEN VISIBLE COUNT CHANGES =====
  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  // ===== GET CARD WIDTH FROM DOM =====
  const getCardMetrics = useCallback(() => {
    const track = trackRef.current;
    if (!track) return null;
    const firstCard = track.querySelector(`.${styles.cardLink}`);
    if (!firstCard) return null;
    const cardWidth = firstCard.getBoundingClientRect().width;
    return { cardWidth, step: cardWidth + CARD_GAP_PX };
  }, []);

  // ===== PROGRAMMATIC SCROLL TO A GIVEN INDEX =====
  const scrollToIndex = useCallback((index) => {
    const track = trackRef.current;
    const metrics = getCardMetrics();
    if (!track || !metrics) return;

    const target = metrics.step * index;

    // Disable snap temporarily so the smooth scroll can land where we tell it
    track.style.scrollSnapType = 'none';
    track.scrollTo({ left: target, behavior: 'smooth' });

    // Re-enable snap after scroll settles
    window.clearTimeout(track.__snapTimeout);
    track.__snapTimeout = window.setTimeout(() => {
      track.style.scrollSnapType = '';
    }, 700);
  }, [getCardMetrics]);

  // ===== GO TO A SPECIFIC INDEX (single source of truth) =====
  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setActiveIndex(clamped);
    scrollToIndex(clamped);
  }, [maxIndex, scrollToIndex]);

  const handlePrev = () => {
    goTo(activeIndex <= 0 ? maxIndex : activeIndex - 1);
    // Manual press pauses auto-advance briefly
    setManualPauseUntil(Date.now() + 8000);
  };

  const handleNext = () => {
    goTo(activeIndex >= maxIndex ? 0 : activeIndex + 1);
    setManualPauseUntil(Date.now() + 8000);
  };

  const handleDotClick = (i) => {
    goTo(i);
    setManualPauseUntil(Date.now() + 8000);
  };

  // ===== AUTO-ADVANCE =====
  // Uses a single interval that always advances from latest state via setActiveIndex(prev => ...)
  useEffect(() => {
    if (totalSlides === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      // Skip if paused by hover or manual action
      if (paused) return;
      if (now < manualPauseUntil) return;

      setActiveIndex((prev) => {
        const next = prev >= maxIndex ? 0 : prev + 1;
        // Scroll to next without depending on state above
        const track = trackRef.current;
        const metrics = getCardMetrics();
        if (track && metrics) {
          track.style.scrollSnapType = 'none';
          track.scrollTo({
            left: metrics.step * next,
            behavior: 'smooth'
          });
          window.clearTimeout(track.__snapTimeout);
          track.__snapTimeout = window.setTimeout(() => {
            track.style.scrollSnapType = '';
          }, 700);
        }
        return next;
      });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [paused, maxIndex, totalSlides, manualPauseUntil, getCardMetrics]);

  // ===== SYNC ACTIVE INDEX WHEN USER SCROLLS MANUALLY =====
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const metrics = getCardMetrics();
        if (metrics && metrics.step > 0) {
          const idx = Math.round(track.scrollLeft / metrics.step);
          setActiveIndex(Math.max(0, Math.min(idx, maxIndex)));
        }
        rafId = null;
      });
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [getCardMetrics, maxIndex]);

  const dots = Array.from({ length: maxIndex + 1 });

  return (
    <section className={styles.servicesPreview}>
      <div className="container">
        <div className="section-title">
          <span className="badge">What We Do</span>
          <h2>Our Services</h2>
          <p>Professional branding and printing solutions for your business</p>
        </div>
      </div>

      {loading && (
        <div className="container">
          <p className={styles.empty}>Loading services...</p>
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="container">
          <p className={styles.empty}>Services coming soon.</p>
        </div>
      )}

      {!loading && services.length > 0 && (
        <>
          <div
            className={styles.carouselWrap}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            <button
              type="button"
              className={`${styles.navArrow} ${styles.navArrowLeft}`}
              onClick={handlePrev}
              aria-label="Previous service"
            >
              <FaChevronLeft />
            </button>

            <div className={styles.track} ref={trackRef}>
              {services.map((service) => (
                <Link
                  key={service.id}
                  to={`/services/${service.slug}`}
                  className={styles.cardLink}
                >
                  <div className={styles.card}>
                    <div
                      className={styles.cardIcon}
                      style={{ background: service.color }}
                    >
                      <span>{service.icon}</span>
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.short_description}</p>
                    <span className={styles.learnMore}>Learn more →</span>
                  </div>
                </Link>
              ))}
            </div>

            <button
              type="button"
              className={`${styles.navArrow} ${styles.navArrowRight}`}
              onClick={handleNext}
              aria-label="Next service"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className={styles.pagination}>
            {dots.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
                onClick={() => handleDotClick(i)}
                aria-label={`Go to service ${i + 1}`}
                aria-current={i === activeIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          <div className={styles.viewAll}>
            <Link to="/services" className="btn-primary">
              View All Services
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default ServicesPreview;