import React, { useState } from 'react';
import { validateEmail } from '../utils/validation';
import api from '../services/api';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState('email'); // email, verify, reset

  if (!isOpen) return null;

  const handleSendReset = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setEmail('');
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content forgot-password-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><i className="fas fa-key"></i> Reset Password</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <h3>Check Your Email</h3>
              <p>Password reset instructions have been sent to {email}</p>
              <p className="note">(In mock mode, this is just a simulation)</p>
            </div>
          ) : (
            <form onSubmit={handleSendReset}>
              <p className="instruction-text">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@agritrace.com"
                  disabled={loading}
                  autoFocus
                />
                {error && <span className="error-text">{error}</span>}
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </div>
            </form>
          )}
        </div>

        <style jsx="true">{`
          .forgot-password-modal {
            max-width: 400px;
          }
          
          .instruction-text {
            color: var(--gray);
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
            line-height: 1.5;
          }
          
          .success-message {
            text-align: center;
            padding: 1.5rem;
          }
          
          .success-message i {
            font-size: 3rem;
            color: var(--success);
            margin-bottom: 1rem;
          }
          
          .success-message h3 {
            color: var(--dark);
            margin-bottom: 0.5rem;
          }
          
          .success-message p {
            color: var(--gray);
            margin-bottom: 0.5rem;
          }
          
          .success-message .note {
            font-size: 0.85rem;
            color: var(--primary);
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px dashed var(--light-gray);
          }
          
          .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
          }
          
          .modal-actions button {
            flex: 1;
          }
          
          .error-text {
            color: var(--error);
            font-size: 0.85rem;
            margin-top: 0.3rem;
            display: block;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;