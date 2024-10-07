// src/components/AddUserForm.js
import React, { useState } from 'react';
import userIcon from '../../../../assets/user.svg';
import twitterIcon from '../../../../assets/twitter.svg';

const AddUserForm = ({ onAddUser, onClose }) => {
  const [name, setName] = useState('');
  const [twitter, setTwitter] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newUser = {
      name,
      twitter,
      category: 'en_güvendiklerim',
      coins: [],
    };

    onAddUser(newUser);

    // Formu temizle ve modalı kapat
    setName('');
    setTwitter('');
    onClose();
  };

  return (
    <form className="add-user-form" onSubmit={handleSubmit}>
      <h3>Yeni Kullanıcı Ekle</h3>
      <div className="input-group">
        <img src={userIcon} alt="Kullanıcı" className="input-icon" />
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <img src={twitterIcon} alt="Twitter" className="input-icon" />
        <input
          type="url"
          placeholder="Twitter Adresi"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          required
        />
      </div>
      <button type="submit">Ekle</button>
    </form>
  );
};

export default AddUserForm;
