// src/components/Manage/ManageBookingPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './ManageBookingPage.module.css';

const ManageBookingPage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/login');
        return;
      }
      setUser(session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (!error) setOrders(data || []);
      setLoading(false);
    };

    loadOrders();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const statusClass = (status) =>
    styles[status?.replace(/\s/g, '')] || '';

  if (loading) {
    return (
      <section className="container">
        <div className={styles.managePage}>
          <p className={styles.loading}>Loading your orders...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container">
      <div className={styles.managePage}>
        <div className={styles.topBar}>
          <div>
            <span className="badge">My Account</span>
            <h2>My Orders</h2>
            <p className={styles.welcome}>
              Welcome, <strong>{user?.user_metadata?.full_name || user?.email}</strong>
            </p>
          </div>
          <button onClick={handleSignOut} className={styles.signOutBtn}>
            Sign out
          </button>
        </div>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <h3>No orders yet</h3>
            <p>You haven't placed any orders. Once you do, they'll appear here.</p>
            <Link to="/contact" className="btn-primary">
              Make Your First Order
            </Link>
          </div>
        ) : (
          <>
            <p className={styles.summary}>
              You have <strong>{orders.length}</strong> order{orders.length > 1 ? 's' : ''}
            </p>

            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div key={order.id} className={styles.bookingCard}>
                  <div className={styles.bookingHeader}>
                    <div>
                      <span className={styles.bookingLabel}>Booking ID</span>
                      <h3>{order.booking_ref}</h3>
                    </div>
                    <span className={`${styles.status} ${statusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className={styles.bookingDetails}>
                    <div className={styles.detail}>
                      <span>Service</span>
                      <p>{order.service || '—'}</p>
                    </div>
                    <div className={styles.detail}>
                      <span>Deadline</span>
                      <p>{order.deadline || '—'}</p>
                    </div>
                    <div className={styles.detail}>
                      <span>Placed</span>
                      <p>{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressLabel}>
                      <span>Project Progress</span>
                      <strong>{order.progress || 0}%</strong>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${order.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {order.notes && (
                    <div className={styles.notes}>
                      <span>Latest Update</span>
                      <p>{order.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className={styles.bottomActions}>
          <Link to="/contact" className={styles.helpLink}>
            Need help? Contact us →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ManageBookingPage;