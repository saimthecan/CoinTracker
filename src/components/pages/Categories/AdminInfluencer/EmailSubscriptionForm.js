import React, { useState } from 'react';
import './EmailSubscriptionForm.css';

const EmailSubscriptionForm = ({ onSubmitEmail, onClose }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitEmail(email);
  };

  return (
    <div className="email-subscription-form">
      <h2>Subscribe to Email Notifications</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="email-input"
        />
        <div className="button-group">
          <button type="submit" className="subscribe-button">Subscribe</button>
          <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EmailSubscriptionForm;
