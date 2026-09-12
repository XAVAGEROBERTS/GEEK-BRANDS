// src/components/Layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import styles from './Footer.module.css';
import logoImage from '../../assets/images/Geekbrands.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useData();

  // Defaults used until settings load / if a field is empty
  const phone = settings?.contact_phone || '+256 743040345';
  const email = settings?.contact_email || 'ismaelnuwamanya19@gmail.com';
  const location = settings?.contact_location || 'Kampala, Uganda';

  const socials = {
    facebook: settings?.facebook_url || 'https://www.facebook.com/share/17x86iQxkq/?mibextid=wwXIfr',
    twitter: settings?.twitter_url || '#',
    instagram: settings?.instagram_url || 'https://www.instagram.com/geekbrands01',
    tiktok: settings?.tiktok_url || 'https://www.tiktok.com/@geekbrands',
    linkedin: settings?.linkedin_url || 'https://www.linkedin.com/in/nuwamanya-ismael',
    youtube: settings?.youtube_url || '#'
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* ===== COLUMN 1: LOGO + DESCRIPTION + SOCIALS ===== */}
        <div className={styles.footerCol}>
          <Link to="/" className={styles.logo}>
            <img
              src={logoImage}
              alt="Geek Brands - Print It. Flex It."
              className={styles.logoImage}
            />
          </Link>
          <p className={styles.description}>
            We design, print and brand products, businesses, vehicles, offices,
            schools and everything in between. Your brand deserves to stand out.
          </p>

          <div className={styles.socialList}>
            <a href={socials.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href={socials.twitter} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href={socials.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href={socials.tiktok} aria-label="TikTok" target="_blank" rel="noopener noreferrer">
              <FaTiktok />
            </a>
            <a href={socials.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
            <a href={socials.youtube} aria-label="YouTube" target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* ===== COLUMN 2: QUICK LINKS ===== */}
        <div className={styles.footerCol}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/services">Our Services</Link></li>
            <li><Link to="/portfolio">Our Work</Link></li>
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/why-geek-brands">Why Geek Brands</Link></li>
            <li><Link to="/order">Make an Order</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* ===== COLUMN 3: SERVICES ===== */}
        <div className={styles.footerCol}>
          <h3>Our Services</h3>
          <ul>
            <li><Link to="/services/product-stickers-packaging">Product Stickers & Packaging</Link></li>
            <li><Link to="/services/marketing-promotional-items">Marketing & Promotional Items</Link></li>
            <li><Link to="/services/car-vehicle-branding">Car & Vehicle Branding</Link></li>
            <li><Link to="/services/digital-large-format-printing">Digital & Large Format Printing</Link></li>
            <li><Link to="/services/signages">Signages</Link></li>
            <li><Link to="/services/learning-materials">Learning Materials</Link></li>
          </ul>
        </div>

        {/* ===== COLUMN 4: CONTACT ===== */}
        <div className={styles.footerCol}>
          <h3>Contact Info</h3>
          <ul className={styles.contactList}>
            <li>
              <FaMapMarkerAlt />
              <span>{location}</span>
            </li>
            <li>
              <FaPhoneAlt />
              <span>{phone}</span>
            </li>
            <li>
              <FaEnvelope />
              <span>{email}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {currentYear} Geek Brands. All rights reserved.</p>
        <p>
          <Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms of Use</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;