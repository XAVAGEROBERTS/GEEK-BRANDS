// src/components/Home/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Hero from './Hero';
import ServicesPreview from './ServicesPreview';
import WhyUs from './WhyUs';
import FinalCTA from './FinalCTA';
import WhatsAppFloat from './WhatsAppFloat';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [showBar, setShowBar] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBar(window.scrollY < 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div className={styles.homePage}>
      {/* ===== HERO SLIDER ===== */}
      <Hero />

      {/* ===== ACTION BAR ===== */}
      <div
        className={`${styles.absoluteBar} ${!showBar ? styles.absoluteBarHidden : ''}`}
      >
        <div className={styles.barContent}>
          <div className={styles.barActions}>
            <Link to="/order" className={styles.barButtonPrimary}>
              Order
            </Link>
            <Link to="/manage" className={styles.barButton}>
              Track your orders
            </Link>
          </div>
        </div>
      </div>

      {/* ===== BRAND STATEMENT STRIP ===== */}
      <div className={styles.brandStrip}>
        <div className="container">
          <div className={styles.brandStripInner}>
        
            <p className={styles.brandStripTagline}>
              We make brands <span>hotter</span> than your crush.
            </p>
          </div>
        </div>
      </div>

      {/* ===== SECTIONS ===== */}
      <ServicesPreview />
      <WhyUs />
      <FinalCTA />

      {/* ===== FLOATING WHATSAPP ===== */}
      <WhatsAppFloat />
    </div>
  );
};

export default HomePage;