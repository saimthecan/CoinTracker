// src/components/Guvendiklerim.js
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Guvendiklerim.css';
import twitterLogo from '../../../../assets/twitter.svg';
import { UserContext } from '../../../../../src/context/UserContext';
import Modal from '../Modal/Modal';
import userIcon from '../../../../assets/user.svg';
import twitterIcon from '../../../../assets/twitter.svg';
import deleteIcon from '../../../../assets/delete.svg';

const Guvendiklerim = () => {
  const [GuvendiklerimUsers, setGuvendiklerimUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const { selectedUsers, addUserToSelected, removeUserFromSelected, isUserSelected } = useContext(UserContext);

  // Fetch users belonging to 'güvendiklerim' category
  useEffect(() => {
    axios
      .get('https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users')
      .then((response) => {
        const users = response.data;
        const Guvendiklerim = users.filter(
          (user) => user.category === 'güvendiklerim'
        );
        setGuvendiklerimUsers(Guvendiklerim);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);

  // Handle toggling favorite status
  const handleToggleFavorite = (user) => {
    if (isUserSelected(user._id)) {
      removeUserFromSelected(user._id);
    } else {
      addUserToSelected(user);
    }
  };

  // Handle user deletion
  const handleDeleteUser = (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      axios
        .delete(`https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users/${userId}`)
        .then(() => {
          setGuvendiklerimUsers(GuvendiklerimUsers.filter(user => user._id !== userId));
        })
        .catch((error) => {
          console.error('Kullanıcı silinirken hata oluştu:', error);
        });
    }
  };

  // Handle adding a new user
  const handleAddUser = (newUser) => {
    axios
      .post('https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users', newUser)
      .then((response) => {
        const addedUser = response.data;
        setGuvendiklerimUsers([...GuvendiklerimUsers, addedUser]);
      })
      .catch((error) => {
        console.error('Kullanıcı eklenirken hata oluştu:', error);
      });
  };

  return (
    <div className="container">
      {/* "Card Ekle" Button */}
      <button className="add-card-button" onClick={() => setShowAddUserModal(true)}>
      <span className="desktop-text">Kullanıcı Ekle</span>
  <span className="mobile-text">+</span>
      </button>

      {/* New User Modal */}
      <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)}>
        <AddUserForm onAddUser={handleAddUser} onClose={() => setShowAddUserModal(false)} />
      </Modal>

      <div className="card-container">
        {GuvendiklerimUsers.map(user => {
          const isSelected = isUserSelected(user._id);

          return (
            <div key={user._id} className="user-card">
              {/* Delete Icon */}
              <div className="delete-icon-container" onClick={() => handleDeleteUser(user._id)}>
                <img src={deleteIcon} alt="Sil" className="delete-icon" />
              </div>
              
              {/* Star Icon */}
              <div className="star-icon-container" onClick={() => handleToggleFavorite(user)}>
                {isSelected ? (
                  // Filled star
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#FFD700"
                    stroke="#FFD700"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="star-icon"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ) : (
                  // Empty star
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="star-icon"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                )}
              </div>

              {/* Twitter Logo */}
              <a href={user.twitter} target="_blank" rel="noopener noreferrer">
                <img src={twitterLogo} alt="Twitter" className="twitter-logo" />
              </a>

              {/* User Name */}
              <Link to={`/user/${user._id}`} className="user-name-link">
                <h3 className="user-name">{user.name}</h3>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AddUserForm = ({ onAddUser, onClose }) => {
  const [name, setName] = useState('');
  const [twitter, setTwitter] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newUser = {
      name,
      twitter,
      category: 'güvendiklerim',
      coins: []
    };

    onAddUser(newUser);

    // Clear form and close modal
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

export default Guvendiklerim;
