// src/components/Layout/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaSignOutAlt,
  FaBoxOpen
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import styles from './Header.module.css';
import logoImage from '../../assets/images/Geekbrands.png';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ SAFE: always an array
  const { services: rawServices } = useData();
  const services = rawServices || [];

  // ===== AUTH STATE =====
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAvatarError(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.id]);

  useEffect(() => {
    setOpenDropdown(null);
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const handleNavClick = () => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setUserMenuOpen(false);
  };

  // ✅ DYNAMIC SERVICE LINKS (safe)
  const serviceLinks = [
    { path: '/services', label: 'All Services' },
    ...services.map((s) => ({
      path: `/services/${s.slug}`,
      label: s.title
    }))
  ];

  const companyLinks = [
    { path: '/about', label: 'About Us' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/why-geek-brands', label: 'Why Geek Brands' },
    { path: '/team', label: 'Team' }
  ];

  const isCompanyActive = companyLinks.some((l) => location.pathname === l.path);
  const isServiceActive = serviceLinks.some((l) => location.pathname === l.path);

  // ===== AVATAR HELPERS =====
  const getAvatarUrl = () => {
    if (!user) return null;
    if (user.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    if (user.user_metadata?.picture) return user.user_metadata.picture;

    const googleIdentity = user.identities?.find((id) => id.provider === 'google');
    if (googleIdentity?.identity_data?.avatar_url) return googleIdentity.identity_data.avatar_url;
    if (googleIdentity?.identity_data?.picture) return googleIdentity.identity_data.picture;

    const anyIdentity = user.identities?.[0];
    if (anyIdentity?.identity_data?.avatar_url) return anyIdentity.identity_data.avatar_url;
    if (anyIdentity?.identity_data?.picture) return anyIdentity.identity_data.picture;

    return null;
  };

  const getAvatarLetter = () => {
    if (!user) return 'U';
    const source =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      'U';
    return source.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (!user) return 'Account';
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Account'
    );
  };

  const avatarUrl = getAvatarUrl();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link to="/" className={styles.logo} onClick={handleNavClick}>
          <img src={logoImage} alt="Geek Brands" className={styles.logoImage} />
        </Link>

        <nav className={styles.nav} ref={dropdownRef}>
          <ul className={styles.navList}>
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                Home
              </NavLink>
            </li>

            {/* ===== SERVICES DROPDOWN — HOVER ===== */}
            <li
              className={styles.dropdownItem}
              onMouseEnter={() => setOpenDropdown('services')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                className={`${styles.dropdownTrigger} ${isServiceActive ? styles.active : ''}`}
                aria-expanded={openDropdown === 'services'}
              >
                Services <FaChevronDown className={styles.chevron} />
              </button>

              {openDropdown === 'services' && (
                <div className={styles.dropdown}>
                  {serviceLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) =>
                        `${styles.dropdownLink} ${isActive ? styles.dropdownActive : ''}`
                      }
                      onClick={handleNavClick}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </li>

            <li>
              <NavLink
                to="/portfolio"
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                Our Work
              </NavLink>
            </li>

            {/* ===== COMPANY DROPDOWN — HOVER ===== */}
            <li
              className={styles.dropdownItem}
              onMouseEnter={() => setOpenDropdown('company')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                className={`${styles.dropdownTrigger} ${isCompanyActive ? styles.active : ''}`}
                aria-expanded={openDropdown === 'company'}
              >
                Company <FaChevronDown className={styles.chevron} />
              </button>

              {openDropdown === 'company' && (
                <div className={styles.dropdown}>
                  {companyLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) =>
                        `${styles.dropdownLink} ${isActive ? styles.dropdownActive : ''}`
                      }
                      onClick={handleNavClick}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </li>

            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                Contact
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className={styles.headerRight}>
          {user ? (
            <div className={styles.userMenuWrap} ref={userMenuRef}>
              <button
                type="button"
                className={styles.userBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
              >
                {avatarUrl && !avatarError ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className={styles.userAvatarImg}
                    onError={() => setAvatarError(true)}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className={styles.userAvatarLetter}>
                    {getAvatarLetter()}
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userInfo}>
                    <strong>{getDisplayName()}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className={styles.userDivider} />
                  <NavLink
                    to="/manage"
                    className={styles.userMenuItem}
                    onClick={handleNavClick}
                  >
                    <FaBoxOpen /> My Orders
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={styles.userMenuSignOut}
                  >
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className={styles.loginLink}
              onClick={handleNavClick}
            >
              Login
            </NavLink>
          )}

          <Link to="/order" className={styles.orderBtn} onClick={handleNavClick}>
            Make an Order
          </Link>

          <button
            className={styles.mobileToggle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* ===== MOBILE NAV ===== */}
        <nav
          className={`${styles.mobileNav} ${mobileOpen ? styles.mobileNavOpen : ''}`}
        >
          <NavLink to="/" end className={styles.mobileLink} onClick={handleNavClick}>
            Home
          </NavLink>

          <div className={styles.mobileGroup}>
            <span className={styles.mobileGroupLabel}>Services</span>
            {serviceLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={styles.mobileSublink}
                onClick={handleNavClick}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <NavLink
            to="/portfolio"
            className={styles.mobileLink}
            onClick={handleNavClick}
          >
            Our Work
          </NavLink>

          <div className={styles.mobileGroup}>
            <span className={styles.mobileGroupLabel}>Company</span>
            {companyLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={styles.mobileSublink}
                onClick={handleNavClick}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <NavLink
            to="/contact"
            className={styles.mobileLink}
            onClick={handleNavClick}
          >
            Contact
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/manage"
                className={styles.mobileLink}
                onClick={handleNavClick}
              >
                My Orders
              </NavLink>
              <button onClick={handleSignOut} className={styles.mobileSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={styles.mobileLink}
              onClick={handleNavClick}
            >
              Login
            </NavLink>
          )}

          <Link
            to="/order"
            className={styles.mobileOrderBtn}
            onClick={handleNavClick}
          >
            Make an Order
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;