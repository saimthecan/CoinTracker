import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./EnGuvendiklerim.css";
import twitterLogo from "../../../../assets/twitter.svg";
import Modal from "../Modal/Modal";
import Pagination from "../../../../Pagination/Pagination";
import AddUserForm from "./AddUserForm";
import StarIcon from "../../../../StarIcons/StarIcon";
import EmptyStarIcon from "../../../../StarIcons/EmptyStarIcon";
import deleteIcon from "../../../../assets/delete.svg";
import { useEnGuvendiklerim } from "./useEnGuvendiklerim";

const EnGuvendiklerim = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const { enGuvendiklerimUsers, handleToggleFavorite, handleDeleteUser, handleAddUser, isUserSelected } = useEnGuvendiklerim();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = enGuvendiklerimUsers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(enGuvendiklerimUsers.length / itemsPerPage);

  // Pagination'ın gösterilip gösterilmediğini takip eden state
  const [isPaginationVisible, setIsPaginationVisible] = useState(false);

  return (
    <div className="container">
      <header className="favorites-header">
        <h1>En Güvendiklerim</h1>
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
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
      >
        <AddUserForm
          onAddUser={handleAddUser}
          onClose={() => setShowAddUserModal(false)}
        />
      </Modal>

      <div className="card-container">
        {currentUsers.map((user) => {
          const isSelected = isUserSelected(user._id);

          return (
            <div key={user._id} className="user-card">
              {/* Delete Icon */}
              <div
                className="delete-icon-container"
                onClick={() => handleDeleteUser(user._id)}
              >
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
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onVisibilityChange={setIsPaginationVisible} // Pagination görünürlüğünü buradan takip ediyoruz
        />
      )}
    </div>
  );
};

export default EnGuvendiklerim;
