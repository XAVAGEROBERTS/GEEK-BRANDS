// src/components/Home/WhyUs.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './WhyUs.module.css';

const AUTO_ADVANCE_MS = 5000;
const CARD_GAP_PX = 24; // must match CSS `gap: 1.5rem` on desktop

const WhyUs = () => {
  const trackRef = useRef(null);

  const features = [
    {
      icon: '🎯',
      title: 'We understand branding.',
      description:
        "We don't just put your logo on something. We think about how your brand should look and feel."
    },
    {
      icon: '✨',
      title: 'We care about quality.',
      description:
        'Good printing is more than ink and paper. Finishing, clarity, colour and presentation matter.'
    },
    {
      icon: '🚀',
      title: 'We keep things moving.',
      description:
        "When you need your branding, you don't want excuses. You want progress."
    },
    {
      icon: '🤝',
      title: 'We make it easy.',
      description:
        "Tell us what you need. Share your idea. We'll help you figure out the rest."
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [manualPauseUntil, setManualPauseUntil] = useState(0);
  const [gapPx, setGapPx] = useState(CARD_GAP_PX);

  const totalSlides = features.length;

  // ===== HOW MANY CARDS FIT IN VIEW + GAP =====
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 992) {
        setVisibleCount(4);
        setGapPx(32);
      } else if (w >= 640) {
        setVisibleCount(2);
        setGapPx(24);
      } else {
        setVisibleCount(1);
        setGapPx(16);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, totalSlides - visibleCount);

  // Clamp index when visible count changes
  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  // Get card width from DOM
  const getCardMetrics = useCallback(() => {
    const track = trackRef.current;
    if (!track) return null;
    const firstCard = track.querySelector(`.${styles.featureCard}`);
    if (!firstCard) return null;
    const cardWidth = firstCard.getBoundingClientRect().width;
    return { cardWidth, step: cardWidth + gapPx };
  }, [gapPx]);

  // Programmatic scroll
  const scrollToIndex = useCallback(
    (index) => {
      const track = trackRef.current;
      const metrics = getCardMetrics();
      if (!track || !metrics) return;

      const target = metrics.step * index;

      track.style.scrollSnapType = 'none';
      track.scrollTo({ left: target, behavior: 'smooth' });

      window.clearTimeout(track.__snapTimeout);
      track.__snapTimeout = window.setTimeout(() => {
        track.style.scrollSnapType = '';
      }, 700);
    },
    [getCardMetrics]
  );

  const goTo = useCallback(
    (index) => {
      const clamped = Math.max(0, Math.min(index, maxIndex));
      setActiveIndex(clamped);
      scrollToIndex(clamped);
    },
    [maxIndex, scrollToIndex]
  );

  const handlePrev = () => {
    goTo(activeIndex <= 0 ? maxIndex : activeIndex - 1);
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
  useEffect(() => {
    if (totalSlides === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (paused) return;
      if (now < manualPauseUntil) return;

      setActiveIndex((prev) => {
        const next = prev >= maxIndex ? 0 : prev + 1;
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

  // ===== SYNC ACTIVE INDEX ON MANUAL SCROLL =====
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
    <section className={styles.whyUs}>
      <div className="container">
        <div className="section-title">
          <span className="badge">Why Choose Us</span>
          <h2>Why Geek Brands?</h2>
          <p>Here's what makes us different</p>
        </div>
      </div>

      <div
        className={styles.carouselWrap}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Prev arrow */}
        {maxIndex > 0 && (
          <button
            type="button"
            className={`${styles.navArrow} ${styles.navArrowLeft}`}
            onClick={handlePrev}
            aria-label="Previous feature"
          >
            <FaChevronLeft />
          </button>
        )}

        <div className={styles.track} ref={trackRef}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Next arrow */}
        {maxIndex > 0 && (
          <button
            type="button"
            className={`${styles.navArrow} ${styles.navArrowRight}`}
            onClick={handleNext}
            aria-label="Next feature"
          >
            <FaChevronRight />
          </button>
        )}
      </div>

      {/* Dots */}
      {maxIndex > 0 && (
        <div className={styles.pagination}>
          {dots.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
              onClick={() => handleDotClick(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default WhyUs;