// src/components/Guvendiklerim.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Guvendiklerim.css';
import twitterLogo from '../../../../assets/twitter.svg';
import StarIcon from "../../../../StarIcons/StarIcon";
import EmptyStarIcon from "../../../../StarIcons/EmptyStarIcon";
import Modal from '../Modal/Modal';
import deleteIcon from '../../../../assets/delete.svg';
import { useGuvendiklerim } from "./useGuvendiklerim";
import AddUserForm from "./AddUserForm";
import Pagination from "../../../../Pagination/Pagination";


const Guvendiklerim = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  
  // Hook'tan gelen işlemler
  const { GuvendiklerimUsers, handleToggleFavorite, handleDeleteUser, handleAddUser, isUserSelected } = useGuvendiklerim();

  // Sayfalama için state'ler
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Her sayfada gösterilecek kullanıcı sayısı

  // Kullanıcıları sayfalara bölüyoruz
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = GuvendiklerimUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Toplam sayfa sayısı
  const totalPages = Math.ceil(GuvendiklerimUsers.length / itemsPerPage);

    // Pagination'ın gösterilip gösterilmediğini takip eden state
    const [isPaginationVisible, setIsPaginationVisible] = useState(false);

  return (
    <div className="container">
      <header className="favorites-header">
        <h1>Güvendiklerim</h1>
      </header>
      
      {/* "Card Ekle" Button */}
      <button
        className={`add-card-button ${isPaginationVisible ? "with-pagination" : ""}`}
        onClick={() => setShowAddUserModal(true)}
      >
        <span className="desktop-text">Kullanıcı Ekle</span>
        <span className="mobile-text">+</span>
      </button>

      {/* New User Modal */}
      <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)}>
        <AddUserForm onAddUser={handleAddUser} onClose={() => setShowAddUserModal(false)} />
      </Modal>

      <div className="card-container">
        {currentUsers.map(user => {
          const isSelected = isUserSelected(user._id);

          return (
            <div key={user._id} className="user-card">
              {/* Delete Icon */}
              <div className="delete-icon-container" onClick={() => handleDeleteUser(user._id)}>
                <img src={deleteIcon} alt="Sil" className="delete-icon" />
              </div>
              
              {/* Star Icon */}
              <div
                className="star-icon-container"
                onClick={() => handleToggleFavorite(user)}
              >
                {isSelected ? <StarIcon /> : <EmptyStarIcon />}
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

      {/* Pagination Component */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage} // Sayfa değişiminde state güncelleniyor
          onVisibilityChange={setIsPaginationVisible}
        />
      )}
    </div>
  );
};

export default Guvendiklerim;
