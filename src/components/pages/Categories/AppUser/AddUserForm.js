// src/components/AddUserForm.js
import React, { useState } from 'react';
import userIcon from '../../../../assets/user.svg';
import twitterIcon from '../../../../assets/x.svg';

const AddUserForm = ({ onAddUser, onClose }) => {
  const [name, setName] = useState('');
  const [twitterUsername, setTwitter] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newInfluencer = {
      name,
      twitter: `https://x.com/${twitterUsername}`,
      coins: [],
    };
  

    onAddUser(newInfluencer);

    // Formu temizle ve modalı kapat
    setName('');
    setTwitter('');
    onClose();
  };

  return (
    <form className="add-user-form" onSubmit={handleSubmit}>
      <h3>Add New User</h3>
      <div className="input-group">
        <img src={userIcon} alt="Kullanıcı" className="input-icon" />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <img src={twitterIcon} alt="Twitter" className="input-icon" />
        <input
         type="text"
           placeholder="X Username (without @)"
          value={twitterUsername}
          onChange={(e) => setTwitter(e.target.value)}
          required
        />
      </div>
      <button type="submit">Add</button>
    </form>
  );
};

export default AddUserForm;
