import React, { useState, useRef, useEffect } from "react";

import { Link } from "react-router-dom";
import "./AdminInfluencer.css";
import twitterLogo from "../../../../assets/x.svg";
import Modal from "../Modal/Modal";
import Pagination from "../../../../Pagination/Pagination";
import AddUserForm from "./AddUserForm";
import StarIcon from "../../../../StarIcons/StarIcon";
import EmptyStarIcon from "../../../../StarIcons/EmptyStarIcon";
import deleteIcon from "../../../../assets/delete.svg";
import { useAdminInfluencer } from "./useAdminInfluencer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSearch, faBell  } from "@fortawesome/free-solid-svg-icons"; // Arama simgesi için
import { useSelector } from "react-redux";
import EmailSubscriptionForm from "./EmailSubscriptionForm"; 

const AdminInfluencer = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // Arama çubuğunu açıp kapamak için state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);


  const searchBarRef = useRef(null);
  const searchIconRef = useRef(null);

  const isAdmin = useSelector((state) => state.user.role === "admin");

  const {
    AdminInfluencerUsers,
    handleToggleFavorite,
    handleDeleteUser,
    handleAddUser,
    loading,
  } = useAdminInfluencer();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // Arama çubuğu için state
  const itemsPerPage = 20;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Arama çubuğuna girilen metne göre filtrelenmiş kullanıcılar
  const filteredUsers = AdminInfluencerUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(AdminInfluencerUsers.length / itemsPerPage);

  const handleNotificationIconClick = () => {
    if (notificationsEnabled) {
      const confirmUnsubscribe = window.confirm(
        'Bildirimleri kapatmak ve email adresinizi silmek istiyor musunuz?'
      );
      if (confirmUnsubscribe) {
        handleEmailUnsubscribe();
      }
    } else {
      setShowEmailModal(true);
    }
  };
  
  const handleEmailUnsubscribe = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(
        `https://cointracker-backend-7786c0daa55a.herokuapp.com/appUser/${storedUser.userId}/unsubscribe-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedUser.token}`,
          },
        }
      );
  
      if (response.ok) {
        alert('Email aboneliğiniz iptal edildi.');
        setNotificationsEnabled(false);
      } else {
        const data = await response.json();
        alert(`Hata: ${data.message}`);
      }
    } catch (error) {
      console.error('Error unsubscribing email:', error);
      alert('Email aboneliğinden çıkarken bir hata oluştu.');
    }
  };
  

  const handleEmailSubmit = async (email) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(
        `https://cointracker-backend-7786c0daa55a.herokuapp.com/appUser/${storedUser.userId}/subscribe-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedUser.token}`,
          },
          body: JSON.stringify({ email }),
        }
      );
  
      if (response.ok) {
        alert('Email subscription successful');
        setNotificationsEnabled(true);
        setShowEmailModal(false);
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error subscribing email:', error);
      alert('An error occurred while subscribing to email notifications.');
    }
  };

 


  const handleSearchIconClick = () => {
    setSearchOpen(!searchOpen); // Arama çubuğunu aç/kapat
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchOpen &&
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target) &&
        searchIconRef.current &&
        !searchIconRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen]);

  useEffect(() => {
    const checkEmailSubscription = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(
          `https://cointracker-backend-7786c0daa55a.herokuapp.com/appUser/${storedUser.userId}`,
          {
            headers: {
              Authorization: `Bearer ${storedUser.token}`,
            },
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          if (data.email) {
            setNotificationsEnabled(true);
          } else {
            setNotificationsEnabled(false);
          }
        }
      } catch (error) {
        console.error('Error checking email subscription:', error);
      }
    };
  
    checkEmailSubscription();
  }, []);
  

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
       {/* Notification Icon */}
    {!isAdmin && (
      <div
        className={`notification-icon-container ${notificationsEnabled ? 'enabled' : ''}`}
        onClick={handleNotificationIconClick}
      >
        <FontAwesomeIcon icon={faBell} className="notification-icon" />
      </div>
    )}

     {/* Rest of the header */}
        <div className="title-and-icon">
          <h1>Crypto Influencers</h1>
          <div
            className="search-icon-container"
            onClick={handleSearchIconClick}
            ref={searchIconRef}
          >
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
        </div>

        {searchOpen && (
          <div className="search-bar-container" ref={searchBarRef}>
            <input
              type="text"
              placeholder="Search Influencers"
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </header>
      {isAdmin && (
        <button
          className={`add-card-button ${
            totalPages > 1 ? "with-pagination" : ""
          }`}
          onClick={() => setShowAddUserModal(true)}
        >
          <span className="desktop-text">Add Influencer</span>
          <span className="mobile-text">+</span>
        </button>
      )}

      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
      >
        <AddUserForm
          onAddUser={handleAddUser}
          onClose={() => setShowAddUserModal(false)}
        />
      </Modal>

         {/* Bildirim modali */}
    <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)}>
      <EmailSubscriptionForm
        onSubmitEmail={handleEmailSubmit}
        onClose={() => setShowEmailModal(false)}
      />
    </Modal>

      <div className="card-container">
        {currentUsers.map((user) => {
          const isSelected = user.isFavorite;

          return (
            <div key={user._id} className="user-card">
              {/* Silme İkonu */}
              {isAdmin && (
                <div
                  className="delete-icon-container"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  <img src={deleteIcon} alt="Delete" className="delete-icon" />
                </div>
              )}

              {/* Yıldız İkonu */}
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

              {/* Kullanıcı İsmi */}
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
        />
      )}
    </div>
  );
};

export default AdminInfluencer;
