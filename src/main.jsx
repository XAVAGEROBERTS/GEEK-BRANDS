// src/main.jsx

// ===== FONTS =====
import '@fontsource/poppins/300.css';   // Light
import '@fontsource/poppins/400.css';   // Regular
import '@fontsource/poppins/500.css';   // Medium
import '@fontsource/poppins/600.css';   // SemiBold
import '@fontsource/poppins/700.css';   // Bold
import '@fontsource/poppins/800.css';   // ExtraBold
import '@fontsource/poppins/900.css';   // Black

// ===== CORE =====
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// ===== CONTEXTS =====
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';

// ===== APP =====
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);