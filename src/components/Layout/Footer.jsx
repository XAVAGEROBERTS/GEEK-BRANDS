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

  // Dynamic contact info from settings (with fallbacks)
  const phone = settings?.contact_phone || '+256 743040345';
  const email = settings?.contact_email || 'ismaelnuwamanya19@gmail.com';
  const location = settings?.contact_location || 'Kampala, Uganda';

  // Social links — only render ones with a real URL
  const socials = [
    {
      name: 'Facebook',
      url:
        settings?.facebook_url ||
        'https://www.facebook.com/share/17x86iQxkq/?mibextid=wwXIfr',
      icon: FaFacebookF
    },
    {
      name: 'Twitter',
      url: settings?.twitter_url,
      icon: FaTwitter
    },
    {
      name: 'Instagram',
      url:
        settings?.instagram_url ||
        'https://www.instagram.com/geekbrands01',
      icon: FaInstagram
    },
    {
      name: 'TikTok',
      url: settings?.tiktok_url || 'https://www.tiktok.com/@geekbrands',
      icon: FaTiktok
    },
    {
      name: 'LinkedIn',
      url:
        settings?.linkedin_url ||
        'https://www.linkedin.com/in/nuwamanya-ismael',
      icon: FaLinkedinIn
    },
    {
      name: 'YouTube',
      url: settings?.youtube_url,
      icon: FaYoutube
    }
  ].filter((s) => s.url && s.url.trim() !== '' && s.url !== '#'); // 👈 hide empty ones

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
            {socials.map(({ name, url, icon: Icon }) => (
              <a
                key={name}
                href={url}
                aria-label={name}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon />
              </a>
            ))}
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
              <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
            </li>
            <li>
              <FaEnvelope />
              <a href={`mailto:${email}`}>{email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {currentYear} Geek Brands. All rights reserved.</p>
        <p>
          <Link to="/privacy">Privacy Policy</Link> |{' '}
          <Link to="/terms">Terms of Use</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;