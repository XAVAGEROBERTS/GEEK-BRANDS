// src/components/Home/Hero.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import styles from './Hero.module.css';

const Hero = () => {
  const { heroSlides, loading } = useData();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = heroSlides || [];
  const total = slides.length;

  useEffect(() => {
    if (currentSlide >= total && total > 0) {
      setCurrentSlide(0);
    }
  }, [total, currentSlide]);

  useEffect(() => {
    if (!isAutoPlaying || total <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % total);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, total]);

  const goToSlide = (index) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <section className={styles.hero} style={{ background: '#1a1a1a' }}>
        <div className={styles.overlay}></div>
        <div className={styles.heroContent}>
          <p style={{ color: '#fff', fontSize: '1rem' }}>Loading…</p>
        </div>
      </section>
    );
  }

  // ===== EMPTY STATE (no admin reference) =====
  if (total === 0) {
    return (
      <section className={styles.hero} style={{ background: '#1a1a1a' }}>
        <div className={styles.overlay}></div>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Geek Brands</span>
          <h1>
            We make brands <span className="highlight">hotter</span> than your crush.
          </h1>
          <div className={styles.heroButtons}>
            <Link to="/order" className="btn-primary">Make Your Order</Link>
            <Link to="/services" className="btn-outline">Explore Our Services</Link>
          </div>
        </div>
      </section>
    );
  }

  const current = slides[currentSlide];

  const textAlign = current.text_align || current.textAlign || 'left';
  const cta1Text = current.cta1 || 'Make Your Order';
  const cta1Link = current.cta1_link || current.cta1Link || '/order';
  const cta2Text = current.cta2 || 'Explore Our Services';
  const cta2Link = current.cta2_link || current.cta2Link || '/services';
  const shouldShowText = current.show_text !== false && current.showText !== false;

  const getTextAlignClass = () => {
    switch (textAlign) {
      case 'left': return styles.textLeft;
      case 'right': return styles.textRight;
      default: return styles.textCenter;
    }
  };

  return (
    <section
      className={`${styles.hero} ${isTransitioning ? styles.transitioning : ''}`}
      style={{ backgroundImage: `url(${current.image})` }}
    >
      <div className={`${styles.overlay} ${!shouldShowText ? styles.overlayLight : ''}`}></div>

      {shouldShowText && (
        <div className={`${styles.heroContent} ${getTextAlignClass()}`}>
          {current.title && <span className={styles.badge}>{current.title}</span>}

          {current.heading && (
            <h1 dangerouslySetInnerHTML={{ __html: current.heading }} />
          )}

          {/* ✅ Description removed */}
          {/* ✅ Tags removed */}

          <div className={styles.heroButtons}>
            {cta1Text && (
              <Link to={cta1Link} className="btn-primary">
                {cta1Text}
              </Link>
            )}
            {cta2Text && (
              <Link to={cta2Link} className="btn-outline">
                {cta2Text}
              </Link>
            )}
          </div>
        </div>
      )}

      {total > 1 && (
        <div className={styles.slideDots}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.slideDot} ${currentSlide === index ? styles.activeDot : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;