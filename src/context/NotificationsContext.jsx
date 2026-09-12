// src/context/NotificationsContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react';
import { supabaseAdmin } from '../lib/supabase';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const [toast, setToast] = useState(null);
  const channelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      const { data: { session } } = await supabaseAdmin.auth.getSession();
      if (cancelled) return;
      if (!session?.user) return;

      // Clean up any existing channel before creating a new one
      if (channelRef.current) {
        supabaseAdmin.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channel = supabaseAdmin
        .channel('orders-admin-feed')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'orders' },
          (payload) => {
            const order = payload.new;
            setNewOrderCount((n) => n + 1);
            setLastEvent({ type: 'new_order', order });
            setToast({
              id: Date.now(),
              title: 'New Order Received',
              message: `${order.customer || 'Someone'} · ${order.service || 'Order'}`,
              orderRef: order.booking_ref
            });
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    setup();

    const { data: authListener } = supabaseAdmin.auth.onAuthStateChange(
      (_e, session) => {
        if (session?.user) {
          setup();
        } else if (channelRef.current) {
          supabaseAdmin.removeChannel(channelRef.current);
          channelRef.current = null;
          setNewOrderCount(0);
          setToast(null);
          setLastEvent(null);
        }
      }
    );

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabaseAdmin.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Auto-dismiss toast after 6s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const clearCount = () => setNewOrderCount(0);
  const dismissToast = () => setToast(null);

  return (
    <NotificationsContext.Provider
      value={{
        newOrderCount,
        lastEvent,
        toast,
        clearCount,
        dismissToast,
        setToast
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);