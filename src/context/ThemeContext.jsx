// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// 🔒 Secret admin path — dark mode only applies inside this
const ADMIN_PATH = '/gb-control-7x9k';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('gb_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  // Apply or remove the dark theme based on current route
  const applyThemeForRoute = () => {
    const isAdminRoute = window.location.pathname.startsWith(ADMIN_PATH);

    if (isAdminRoute) {
      // Inside admin → respect the user's choice
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      // Public site → always force light
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  // Reapply on theme change
  useEffect(() => {
    applyThemeForRoute();
    localStorage.setItem('gb_theme', theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Reapply on route change
  useEffect(() => {
    // Listen to popstate (back/forward buttons)
    window.addEventListener('popstate', applyThemeForRoute);

    // Patch pushState and replaceState to fire custom events on Link navigation
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPush.apply(this, args);
      window.dispatchEvent(new Event('pushstate'));
    };
    window.history.replaceState = function (...args) {
      originalReplace.apply(this, args);
      window.dispatchEvent(new Event('replacestate'));
    };

    window.addEventListener('pushstate', applyThemeForRoute);
    window.addEventListener('replacestate', applyThemeForRoute);

    return () => {
      window.removeEventListener('popstate', applyThemeForRoute);
      window.removeEventListener('pushstate', applyThemeForRoute);
      window.removeEventListener('replacestate', applyThemeForRoute);
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeMode = (mode) => {
    if (mode === 'dark' || mode === 'light') setTheme(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);