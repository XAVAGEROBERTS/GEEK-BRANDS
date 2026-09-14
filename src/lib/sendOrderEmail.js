// src/lib/sendOrderEmail.js
import emailjs from '@emailjs/browser';

// 🔑 Replace these three with your real EmailJS credentials
const SERVICE_ID = 'service_abc123';       // EmailJS → Email Services
const TEMPLATE_ID = 'template_xyz789';     // EmailJS → Email Templates
const PUBLIC_KEY = 'AbCdEfGh123456';       // EmailJS → Account → General

/**
 * Silently sends an order notification email to the admin.
 * Fire-and-forget — never blocks the UI, never shows anything to the customer.
 */
export const sendOrderEmail = async (orderData) => {
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        booking_ref: orderData.booking_ref || 'N/A',
        customer: orderData.customer || 'N/A',
        email: orderData.email || 'N/A',
        phone: orderData.phone || 'N/A',
        business: orderData.business || '—',
        service: orderData.service || '—',
        quantity: orderData.quantity || '—',
        size: orderData.size || '—',
        deadline: orderData.deadline || '—',
        design_for_me: orderData.design_for_me ? 'Yes ✅' : 'No',
        artwork_url: orderData.artwork_url || 'None',
        description: orderData.description || '—'
      },
      { publicKey: PUBLIC_KEY }
    );
    return { success: true };
  } catch (err) {
    console.error('❌ Email notification failed:', err);
    return { success: false, error: err };
  }
};