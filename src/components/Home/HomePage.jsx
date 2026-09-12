// src/components/Home/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import ServicesPreview from './ServicesPreview';
import WhyUs from './WhyUs';
import FeaturedStatement from './FeaturedStatement';
import ProcessPreview from './ProcessPreview';
import FinalCTA from './FinalCTA';
import WhatsAppFloat from './WhatsAppFloat';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [showBar, setShowBar] = useState(true);

  // ✅ Hide the bar once the user scrolls past 120px
  useEffect(() => {
    const handleScroll = () => {
      setShowBar(window.scrollY < 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.homePage}>
      <Hero />

      {/* ===== ABSOLUTE BAR - LEFT SIDE (hides on scroll) ===== */}
      <div
        className={`${styles.absoluteBar} ${!showBar ? styles.absoluteBarHidden : ''}`}
      >
        <div className={styles.barContent}>
          <div className={styles.barText}>
            <h3>Manage Your Branding Projects</h3>
          </div>
          <Link to="/manage" className={styles.barButton}>
            Manage My Booking
          </Link>
        </div>
      </div>

      {/* ===== TRUST STRIP ===== */}
      <div className={styles.trustStrip}>
        <div className="container">
          <div className={styles.trustItems}>
            <span>Creative Design</span>
            <span>Quality Printing</span>
            <span>Fast Turnaround</span>
            <span>Professional Finishing</span>
          </div>
        </div>
      </div>

      {/* ===== INTRODUCTION SECTION ===== */}
      <section className={styles.introSection}>
        <div className="container">
          <div className={styles.introContent}>
            <span className="badge">Who We Are</span>
            <h2>Your brand deserves to stand out.</h2>
            <p>
              A great business can easily get lost in a sea of ordinary branding.
              That's where Geek Brands comes in.
            </p>
            <p>
              We combine creative design, quality printing and professional
              branding to help businesses, organizations, schools and individuals
              turn ideas into things people can actually see, remember and talk
              about.
            </p>
            <p>
              From a small product sticker to a fully branded vehicle, we make
              sure your brand looks the part.
            </p>
            <Link to="/order" className="btn-primary">
              Let's Brand Your Business
            </Link>
          </div>
        </div>
      </section>

      <ServicesPreview />
      <FeaturedStatement />
      <ProcessPreview />
      <WhyUs />
      <FinalCTA />

      {/* ===== FLOATING WHATSAPP BUTTON ===== */}
      <WhatsAppFloat />
    </div>
  );
};

export default HomePage;