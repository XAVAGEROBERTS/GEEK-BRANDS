// src/admin/AdminLayout.jsx
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationsContext';
import {
  FaTachometerAlt,
  FaImages,
  FaBriefcase,
  FaClipboardList,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaArrowLeft,
  FaConciergeBell,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';
import OrderToast from './OrderToast';
import styles from './AdminLayout.module.css';

const ADMIN_PATH = '/gb-control-7x9k';

const AdminLayout = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { newOrderCount, toast, clearCount, dismissToast } = useNotifications();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    setConfirmLogout(false);
    navigate(`${ADMIN_PATH}/login`);
  };

  const links = [
    { to: ADMIN_PATH, label: 'Dashboard', icon: FaTachometerAlt, end: true },
    { to: `${ADMIN_PATH}/hero`, label: 'Hero Slides', icon: FaImages },
    { to: `${ADMIN_PATH}/portfolio`, label: 'Portfolio', icon: FaBriefcase },
    { to: `${ADMIN_PATH}/services`, label: 'Services', icon: FaConciergeBell },
    {
      to: `${ADMIN_PATH}/orders`,
      label: 'Orders',
      icon: FaClipboardList,
      badge: newOrderCount,
      onOpen: clearCount
    },
    { to: `${ADMIN_PATH}/team`, label: 'Team', icon: FaUsers },
    { to: `${ADMIN_PATH}/settings`, label: 'Settings', icon: FaCog }
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span>Geek Brands</span>
          <small>Admin Panel</small>
        </div>

        <nav className={styles.nav}>
          {links.map(({ to, label, icon: Icon, end, badge, onOpen }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => onOpen && onOpen()}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
            >
              <Icon />
              <span>{label}</span>
              {badge > 0 && (
                <span className={styles.badge}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={styles.bottom}>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <NavLink to="/" className={styles.link}>
            <FaArrowLeft />
            <span>Back to Site</span>
          </NavLink>

          <button
            onClick={() => setConfirmLogout(true)}
            className={styles.logout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>

      {/* ===== LIVE ORDER TOAST ===== */}
      {toast && (
        <OrderToast
          key={toast.id}
          title={toast.title}
          message={toast.message}
          orderRef={toast.orderRef}
          onClose={dismissToast}
          onView={() => {
            dismissToast();
            navigate(`${ADMIN_PATH}/orders`);
          }}
        />
      )}

      {/* ===== LOGOUT CONFIRMATION MODAL ===== */}
      <ConfirmModal
        open={confirmLogout}
        title="Log out of admin panel?"
        message="You'll need to sign in again to access the admin dashboard."
        confirmText={loggingOut ? 'Logging out…' : 'Yes, log out'}
        cancelText="Stay signed in"
        variant="danger"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
};

export default AdminLayout;