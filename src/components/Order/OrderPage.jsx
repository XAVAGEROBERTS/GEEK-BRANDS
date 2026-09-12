// src/components/Order/OrderPage.jsx
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import styles from './OrderPage.module.css';

const OrderPage = () => {
  const { services } = useData();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    description: '',
    budget: '',
    timeline: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Order submitted! We will contact you within 24 hours.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: '',
      description: '',
      budget: '',
      timeline: ''
    });
  };

  return (
    <section className="container">
      <div className={styles.orderPage}>
        <div className="section-title">
          <span className="badge">Start Your Project</span>
          <h2>Make Your Order</h2>
          <p>Tell us what you need and we'll bring your vision to life</p>
        </div>

        <div className={styles.orderContent}>
          <div className={styles.orderForm}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="developer"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="developer@example.com"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+256 700 000 000"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="service">Service Required *</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="budget">Budget Range</label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                  >
                    <option value="">Select budget range</option>
                    <option value="10k-50k">KES 10,000 - 50,000</option>
                    <option value="50k-100k">KES 50,000 - 100,000</option>
                    <option value="100k-200k">KES 100,000 - 200,000</option>
                    <option value="200k+">KES 200,000+</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="timeline">Expected Timeline</label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                  >
                    <option value="">Select timeline</option>
                    <option value="1-week">1 week</option>
                    <option value="2-weeks">2 weeks</option>
                    <option value="1-month">1 month</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Project Details *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Describe your project requirements, specifications, and any special requests..."
                />
              </div>

              <button type="submit" className="btn-primary">Submit Order</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderPage;