// src/components/Home.js
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FavoriKullanicilarim.css';
import twitterLogo from '../../../assets/twitter.svg';
import { UserContext } from '../../../../src/context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const FavoriKullanicilarim = () => {
  const { selectedUsers, removeUserFromSelected, fetchFavorites } = useContext(UserContext);
  const [loading, setLoading] = useState(true);  // Yüklenme durumu için state

  useEffect(() => {
    // Favori kullanıcıları çekmeye başladığımızda loading state'ini true yap
    setLoading(true);

    fetchFavorites().finally(() => {
      // API çağrısı tamamlandığında loading state'ini false yap
      setLoading(false);
    });
  }, [fetchFavorites]); // fetchFavorites artık sabit bir fonksiyon referansına sahip

  const handleToggleFavorite = (user) => {
    removeUserFromSelected(user._id);
  };

  if (loading) {
    return (
      <div className="loading-icon">
        <FontAwesomeIcon icon={faSpinner} spin /> {/* Loading icon */}
      </div>
    );
  }

  return (
    <div className="container">
        <header className="favorites-header">
        <h1>Favorite Influencers</h1>
      </header>
      <div className="card-container">
        {loading ? (  // Eğer loading true ise "Loading" mesajını göster
         <div className="loading-icon">
         <FontAwesomeIcon icon={faSpinner} spin /> {/* Loading icon */}
       </div>
        ) : selectedUsers.length > 0 ? (  // Eğer kullanıcılar varsa bunları göster
          selectedUsers.map(user => (
            <div key={user._id} className="user-card">
              {/* Star Icon */}
              <div className="star-icon-container" onClick={() => handleToggleFavorite(user)}>
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
          ))
        ) : (
          <p>Henüz favorilere kullanıcı eklemediniz.</p>
        )}
      </div>
    </div>
  );
};

export default FavoriKullanicilarim;
