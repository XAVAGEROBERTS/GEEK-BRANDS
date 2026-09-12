// src/admin/AccountSecurity.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import styles from './AccountSecurity.module.css';

const AccountSecurity = () => {
  const { user } = useAuth();

  // ===== PASSWORD CHANGE =====
  const [pwdForm, setPwdForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

  // ===== EMAIL CHANGE =====
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });

  const toggleShow = (field) => {
    setShowPwd((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // ===== HANDLE PASSWORD CHANGE =====
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMessage({ type: '', text: '' });

    if (pwdForm.new.length < 6) {
      return setPwdMessage({
        type: 'error',
        text: 'Password must be at least 6 characters.'
      });
    }
    if (pwdForm.new !== pwdForm.confirm) {
      return setPwdMessage({
        type: 'error',
        text: "New passwords don't match."
      });
    }
    if (pwdForm.new === pwdForm.current) {
      return setPwdMessage({
        type: 'error',
        text: 'New password must be different from current one.'
      });
    }

    setPwdLoading(true);

    // Verify current password by trying to sign in
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: pwdForm.current
    });

    if (verifyErr) {
      setPwdLoading(false);
      return setPwdMessage({
        type: 'error',
        text: 'Current password is incorrect.'
      });
    }

    // Update password
    const { error: updateErr } = await supabase.auth.updateUser({
      password: pwdForm.new
    });

    setPwdLoading(false);

    if (updateErr) {
      return setPwdMessage({
        type: 'error',
        text: updateErr.message
      });
    }

    setPwdMessage({
      type: 'success',
      text: 'Password updated successfully!'
    });
    setPwdForm({ current: '', new: '', confirm: '' });
    setTimeout(() => setPwdMessage({ type: '', text: '' }), 4000);
  };

  // ===== HANDLE EMAIL CHANGE =====
  const handleEmailChange = async (e) => {
    e.preventDefault();
    setEmailMessage({ type: '', text: '' });

    const newEmail = emailForm.newEmail.trim().toLowerCase();
    if (!newEmail || !newEmail.includes('@')) {
      return setEmailMessage({
        type: 'error',
        text: 'Please enter a valid email address.'
      });
    }
    if (newEmail === user.email) {
      return setEmailMessage({
        type: 'error',
        text: 'That is already your email address.'
      });
    }
    if (!emailForm.password) {
      return setEmailMessage({
        type: 'error',
        text: 'Please enter your password to confirm.'
      });
    }

    setEmailLoading(true);

    // Verify current password
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: emailForm.password
    });

    if (verifyErr) {
      setEmailLoading(false);
      return setEmailMessage({
        type: 'error',
        text: 'Password is incorrect.'
      });
    }

    // Update email
    const { error: updateErr } = await supabase.auth.updateUser({
      email: newEmail
    });

    setEmailLoading(false);

    if (updateErr) {
      return setEmailMessage({
        type: 'error',
        text: updateErr.message
      });
    }

    setEmailMessage({
      type: 'success',
      text: `Confirmation sent to ${newEmail}. Check that inbox to confirm the change.`
    });
    setEmailForm({ newEmail: '', password: '' });
  };

  return (
    <div className={styles.security}>
      {/* ===== CURRENT ACCOUNT ===== */}
      <div className={styles.currentInfo}>
        <div className={styles.infoRow}>
          <span>Signed in as</span>
          <strong>{user?.email}</strong>
        </div>
      </div>

      {/* ===== CHANGE PASSWORD ===== */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrap}>
            <FaLock />
          </div>
          <div>
            <h3>Change Password</h3>
            <p>Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label>Current Password</label>
            <div className={styles.passwordWrap}>
              <input
                type={showPwd.current ? 'text' : 'password'}
                value={pwdForm.current}
                onChange={(e) =>
                  setPwdForm({ ...pwdForm, current: e.target.value })
                }
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => toggleShow('current')}
                aria-label={showPwd.current ? 'Hide' : 'Show'}
              >
                {showPwd.current ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>New Password</label>
            <div className={styles.passwordWrap}>
              <input
                type={showPwd.new ? 'text' : 'password'}
                value={pwdForm.new}
                onChange={(e) =>
                  setPwdForm({ ...pwdForm, new: e.target.value })
                }
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => toggleShow('new')}
                aria-label={showPwd.new ? 'Hide' : 'Show'}
              >
                {showPwd.new ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Confirm New Password</label>
            <div className={styles.passwordWrap}>
              <input
                type={showPwd.confirm ? 'text' : 'password'}
                value={pwdForm.confirm}
                onChange={(e) =>
                  setPwdForm({ ...pwdForm, confirm: e.target.value })
                }
                placeholder="Re-enter new password"
                required
                minLength={6}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => toggleShow('confirm')}
                aria-label={showPwd.confirm ? 'Hide' : 'Show'}
              >
                {showPwd.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {pwdMessage.text && (
            <div
              className={`${styles.message} ${pwdMessage.type === 'error' ? styles.msgError : styles.msgSuccess}`}
            >
              {pwdMessage.type === 'error' ? <FaTimes /> : <FaCheck />}
              {pwdMessage.text}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={pwdLoading}>
            {pwdLoading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* ===== CHANGE EMAIL ===== */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrap}>
            <FaEnvelope />
          </div>
          <div>
            <h3>Change Email Address</h3>
            <p>You'll need to confirm the new email</p>
          </div>
        </div>

        <form onSubmit={handleEmailChange} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label>Current Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className={styles.readOnly}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>New Email Address</label>
            <input
              type="email"
              value={emailForm.newEmail}
              onChange={(e) =>
                setEmailForm({ ...emailForm, newEmail: e.target.value })
              }
              placeholder="newemail@example.com"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Confirm with Password</label>
            <input
              type="password"
              value={emailForm.password}
              onChange={(e) =>
                setEmailForm({ ...emailForm, password: e.target.value })
              }
              placeholder="Enter your password"
              required
            />
          </div>

          {emailMessage.text && (
            <div
              className={`${styles.message} ${emailMessage.type === 'error' ? styles.msgError : styles.msgSuccess}`}
            >
              {emailMessage.type === 'error' ? <FaTimes /> : <FaCheck />}
              {emailMessage.text}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={emailLoading}>
            {emailLoading ? 'Sending confirmation…' : 'Change Email'}
          </button>

          <p className={styles.note}>
            📧 Supabase will send a confirmation link to your new email. Your login
            only changes after you click it.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AccountSecurity;