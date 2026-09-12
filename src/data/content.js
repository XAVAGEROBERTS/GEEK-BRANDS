// src/context/DataContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [heroSlides, setHeroSlides] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [team, setTeam] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    const loadAll = async () => {
      const [heroRes, portRes, teamRes, setRes, svcRes] = await Promise.all([
        supabase.from('hero_slides').select('*').order('sort_order', { ascending: true }),
        supabase.from('portfolio').select('*').order('sort_order', { ascending: true }),
        supabase.from('team').select('*').order('sort_order', { ascending: true }),
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('services').select('*').order('sort_order', { ascending: true })
      ]);

      setHeroSlides(heroRes.data || []);
      setPortfolio(portRes.data || []);
      setTeam(teamRes.data || []);
      setSettings(setRes.data || null);
      setServices(svcRes.data || []);
      setLoading(false);
    };
    loadAll();
  }, []);

  // ===== LOAD ORDERS (admin only) =====
  const loadOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    return data || [];
  };

  // ===== HERO =====
  const addHeroSlide = async (slide) => {
    const { data, error } = await supabase.from('hero_slides').insert([slide]).select().single();
    if (!error && data) setHeroSlides((prev) => [...prev, data]);
    return { data, error };
  };
  const updateHeroSlide = async (id, updates) => {
    const { data, error } = await supabase.from('hero_slides').update(updates).eq('id', id).select().single();
    if (!error && data) setHeroSlides((prev) => prev.map((s) => (s.id === id ? data : s)));
    return { data, error };
  };
  const deleteHeroSlide = async (id) => {
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (!error) setHeroSlides((prev) => prev.filter((s) => s.id !== id));
    return { error };
  };

  // ===== PORTFOLIO =====
  const addPortfolioItem = async (item) => {
    const { data, error } = await supabase.from('portfolio').insert([item]).select().single();
    if (!error && data) setPortfolio((prev) => [...prev, data]);
    return { data, error };
  };
  const updatePortfolioItem = async (id, updates) => {
    const { data, error } = await supabase.from('portfolio').update(updates).eq('id', id).select().single();
    if (!error && data) setPortfolio((prev) => prev.map((p) => (p.id === id ? data : p)));
    return { data, error };
  };
  const deletePortfolioItem = async (id) => {
    const { error } = await supabase.from('portfolio').delete().eq('id', id);
    if (!error) setPortfolio((prev) => prev.filter((p) => p.id !== id));
    return { error };
  };

  // ===== TEAM =====
  const addTeamMember = async (member) => {
    const { data, error } = await supabase.from('team').insert([member]).select().single();
    if (!error && data) setTeam((prev) => [...prev, data]);
    return { data, error };
  };
  const updateTeamMember = async (id, updates) => {
    const { data, error } = await supabase.from('team').update(updates).eq('id', id).select().single();
    if (!error && data) setTeam((prev) => prev.map((m) => (m.id === id ? data : m)));
    return { data, error };
  };
  const deleteTeamMember = async (id) => {
    const { error } = await supabase.from('team').delete().eq('id', id);
    if (!error) setTeam((prev) => prev.filter((m) => m.id !== id));
    return { error };
  };

  // ===== SERVICES =====
  const addService = async (service) => {
    const { data, error } = await supabase.from('services').insert([service]).select().single();
    if (!error && data) setServices((prev) => [...prev, data]);
    return { data, error };
  };
  const updateService = async (id, updates) => {
    const { data, error } = await supabase.from('services').update(updates).eq('id', id).select().single();
    if (!error && data) setServices((prev) => prev.map((s) => (s.id === id ? data : s)));
    return { data, error };
  };
  const deleteService = async (id) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) setServices((prev) => prev.filter((s) => s.id !== id));
    return { error };
  };

  // ===== ORDERS =====
  const addOrder = async (order) => {
    const { data, error } = await supabase.from('orders').insert([order]).select().single();
    if (!error && data) setOrders((prev) => [data, ...prev]);
    return { data, error };
  };
  const updateOrder = async (id, updates) => {
    const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
    if (!error && data) setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
    return { data, error };
  };
  const deleteOrder = async (id) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (!error) setOrders((prev) => prev.filter((o) => o.id !== id));
    return { error };
  };

  // ===== SETTINGS =====
  const updateSettings = async (updates) => {
    const { data, error } = await supabase
      .from('site_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .single();
    if (!error && data) setSettings(data);
    return { data, error };
  };

  // ===== IMAGE UPLOAD =====
  const uploadImage = async (file, folder = 'general') => {
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from('geekbrands')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) return { url: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('geekbrands')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  };

  return (
    <DataContext.Provider
      value={{
        heroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide,
        portfolio, addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
        team, addTeamMember, updateTeamMember, deleteTeamMember,
        services, addService, updateService, deleteService,
        orders, loadOrders, addOrder, updateOrder, deleteOrder,
        settings, updateSettings,
        uploadImage,
        loading
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);