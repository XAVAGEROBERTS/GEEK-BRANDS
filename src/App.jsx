// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ===== LAYOUT =====
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// ===== CONTEXTS =====
import { NotificationsProvider } from './context/NotificationsContext';

// ===== PUBLIC PAGES =====
import HomePage from './components/Home/HomePage';
import ServicesPage from './components/Services/ServicesPage';
import ServiceDetailPage from './components/Services/ServiceDetailPage';
import AboutPage from './components/About/AboutPage';
import TeamPage from './components/Team/TeamPage';
import ContactPage from './components/Contact/ContactPage';
import OrderPage from './components/Order/OrderPage';
import PortfolioPage from './components/Portfolio/PortfolioPage';
import HowItWorksPage from './components/HowItWorks/HowItWorksPage';
import WhyGeekBrandsPage from './components/WhyGeekBrands/WhyGeekBrandsPage';
import ManageBookingPage from './components/Manage/ManageBookingPage';
import LoginPage from './pages/LoginPage';

// ===== ADMIN =====
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import RequireAuth from './admin/RequireAuth';
import Dashboard from './admin/Dashboard';
import ManageHero from './admin/ManageHero';
import ManagePortfolio from './admin/ManagePortfolio';
import ManageServices from './admin/ManageServices';
import ManageTeam from './admin/ManageTeam';
import ManageOrders from './admin/ManageOrders';
import ManageSettings from './admin/ManageSettings';

import styles from './App.module.css';

// 🔒 Secret admin path
const ADMIN_PATH = '/gb-control-7x9k';

function App() {
  return (
    <div className={styles.app}>
      <Routes>
        {/* ============================================================
            ADMIN — no header/footer
            ============================================================ */}
        <Route path={`${ADMIN_PATH}/login`} element={<AdminLogin />} />

        <Route
          path={ADMIN_PATH}
          element={
            <RequireAuth>
              <NotificationsProvider>
                <AdminLayout />
              </NotificationsProvider>
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="hero" element={<ManageHero />} />
          <Route path="portfolio" element={<ManagePortfolio />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="team" element={<ManageTeam />} />
          <Route path="settings" element={<ManageSettings />} />
        </Route>

        {/* ============================================================
            PUBLIC — with header/footer
            ============================================================ */}
        <Route
          path="*"
          element={
            <>
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/order" element={<OrderPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/services/:slug" element={<ServiceDetailPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/why-geek-brands" element={<WhyGeekBrandsPage />} />
                  <Route path="/manage" element={<ManageBookingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;