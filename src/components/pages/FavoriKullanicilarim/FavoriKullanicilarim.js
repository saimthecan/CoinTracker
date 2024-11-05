// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './FavoriKullanicilarim.css';
import twitterLogo from '../../../assets/x.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAppUser } from '../Categories/AppUser/useAppUser';
import { useAdminInfluencer } from '../Categories/AdminInfluencer/useAdminInfluencer'; // useAppUser hook'unu import edin
import { useSelector } from 'react-redux'; // role almak için

const FavoriKullanicilarim = () => {
  const { role } = useSelector((state) => state.user);
  const isAdmin = role === 'admin';

    // Admin kullanıcı için useAdminInfluencer hook'unu, normal kullanıcı için useAppUser hook'unu kullan
    const {
      AdminInfluencerUsers,
      handleToggleFavorite: handleToggleFavoriteAdmin,
      loading: loadingAdminInfluencer
    } = useAdminInfluencer();

    const {
      AppUserUsers,
      handleToggleFavorite,
      loading: loadingAppUser
    } = useAppUser();

     // Seçilen hook'a göre favori kullanıcıları al
  const favoriteUsers = isAdmin
  ? AdminInfluencerUsers.filter(user => user.isFavorite)
  : AppUserUsers.filter(user => user.isFavorite);


  const loading = isAdmin ? loadingAdminInfluencer : loadingAppUser;
  const handleFavoriteToggle = isAdmin ? handleToggleFavoriteAdmin : handleToggleFavorite;
  
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
      {favoriteUsers.length > 0 ? (
        favoriteUsers.map(user => (
          <div key={user._id} className="user-card">
              {/* Star Icon */}
              <div className="star-icon-container" onClick={() => handleFavoriteToggle(user)}>
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
          <p>No favorite users yet.</p>
        )}
      </div>
    </div>
  );
};

export default FavoriKullanicilarim;
