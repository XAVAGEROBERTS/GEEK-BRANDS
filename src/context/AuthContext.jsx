// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseAdmin } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current ADMIN session
    supabaseAdmin.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for admin auth changes only
    const { data: listener } = supabaseAdmin.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });
    if (error) return { success: false, error: error.message };

    // Verify admin role
    const role = data.user?.user_metadata?.role;
    if (role !== 'admin') {
      await supabaseAdmin.auth.signOut();
      return {
        success: false,
        error: 'Access denied. This account is not authorized for admin access.'
      };
    }

    return { success: true, user: data.user };
  };

  const logout = async () => {
    await supabaseAdmin.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);