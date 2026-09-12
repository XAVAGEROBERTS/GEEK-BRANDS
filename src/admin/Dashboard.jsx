// src/admin/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  FaImages,
  FaBriefcase,
  FaClipboardList,
  FaUsers,
  FaConciergeBell
} from 'react-icons/fa';
import { SkeletonDashboard } from './Loaders';
import styles from './Dashboard.module.css';

const ADMIN_PATH = '/gb-control-7x9k';

const Dashboard = () => {
  const { heroSlides = [], portfolio = [], team = [], services = [], loading } = useData();

  if (loading) return <SkeletonDashboard />;

  const stats = [
    { label: 'Hero Slides', value: heroSlides.length, icon: FaImages, color: '#ad1380', link: `${ADMIN_PATH}/hero` },
    { label: 'Portfolio', value: portfolio.length, icon: FaBriefcase, color: '#df006e', link: `${ADMIN_PATH}/portfolio` },
    { label: 'Services', value: services.length, icon: FaConciergeBell, color: '#27ae60', link: `${ADMIN_PATH}/services` },  // ✅ NEW
    { label: 'Active Orders', value: '→', icon: FaClipboardList, color: '#f5a623', link: `${ADMIN_PATH}/orders` },
    { label: 'Team Members', value: team.length, icon: FaUsers, color: '#2d9cdb', link: `${ADMIN_PATH}/team` }
  ];

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>Welcome back! Here's an overview of your site.</p>

      <div className={styles.grid}>
        {stats.map((s) => (
          <Link key={s.label} to={s.link} className={styles.card}>
            <div className={styles.iconWrap} style={{ background: s.color }}>
              <s.icon />
            </div>
            <div>
              <span className={styles.value}>{s.value}</span>
              <span className={styles.label}>{s.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actions}>
          <Link to={`${ADMIN_PATH}/hero`} className={styles.action}>+ Add Hero Slide</Link>
          <Link to={`${ADMIN_PATH}/portfolio`} className={styles.action}>+ Add Portfolio Item</Link>
          <Link to={`${ADMIN_PATH}/services`} className={styles.action}>+ Add Service</Link>  {/* ✅ NEW */}
          <Link to={`${ADMIN_PATH}/team`} className={styles.action}>+ Add Team Member</Link>
          <Link to={`${ADMIN_PATH}/settings`} className={styles.action}>⚙ Edit Settings</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;