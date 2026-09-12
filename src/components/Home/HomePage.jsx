// src/components/Home/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
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
  const [user, setUser] = useState(null);

  // Hide bar on scroll (desktop only — CSS handles mobile)
  useEffect(() => {
    const handleScroll = () => {
      setShowBar(window.scrollY < 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track auth state to show correct Check-in link
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

      {/* ===== ACTION BAR (desktop floating / mobile stacked) ===== */}
      <div
        className={`${styles.absoluteBar} ${!showBar ? styles.absoluteBarHidden : ''}`}
      >
        <div className={styles.barContent}>
         
          {/* Action buttons */}
          <div className={styles.barActions}>
            <Link to="/order" className={styles.barButtonPrimary}>
              Order
            </Link>

            {user ? (
              <Link to="/manage" className={styles.barButton}>
                Sign In
              </Link>
            ) : (
              <Link to="/login" className={styles.barButton}>
                Check In
              </Link>
            )}

            <Link to="/manage" className={styles.barButton}>
              Track your orders
            </Link>
          </div>
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

      {/* ===== SECTIONS ===== */}
      <ServicesPreview />
      <FeaturedStatement />
      <ProcessPreview />
      <WhyUs />
      <FinalCTA />

      {/* ===== FLOATING WHATSAPP ===== */}
      <WhatsAppFloat />
    </div>
  );
};

export default HomePage;