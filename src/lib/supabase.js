// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase env vars. Check your .env file.');
}

/* ============================================================
   CUSTOMER CLIENT — for public site users
   Uses default storage key: sb-<project>-auth-token
   ============================================================ */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'gb_customer_session',
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/* ============================================================
   ADMIN CLIENT — for admin panel only
   Uses a DIFFERENT storage key so admin/customer never clash
   ============================================================ */
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'gb_admin_session',
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false // 🔒 Don't pick up Google/OAuth redirects on admin
  }
});