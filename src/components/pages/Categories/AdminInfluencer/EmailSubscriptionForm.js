import React, { useState } from 'react';

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
        />
        <button type="submit">Subscribe</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default EmailSubscriptionForm;
