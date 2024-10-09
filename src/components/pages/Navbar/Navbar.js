import React, { useState, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { FaBars, FaHome, FaStar, FaUserFriends, FaNewspaper, FaChartLine, FaHeart } from "react-icons/fa"; // İkonlar eklendi
import Logo from "../../../assets/logo.png";
import "./Navbar.css"; // Import the external CSS

const Navbar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = (e) => {
    e.stopPropagation(); // Event bubbling'i durdurur, başka tıklamaları etkilemez.
    setSidebarOpen((prev) => !prev); // Sidebar'ı açıp kapamak için
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open-body"); // Body'ye class ekler
    } else {
      document.body.classList.remove("sidebar-open-body"); // Body'den class kaldırır
    }
  }, [sidebarOpen]);

  // Sidebar harici bir yere tıklanınca kapanma fonksiyonu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sidebar') && sidebarOpen) {
        setSidebarOpen(false); // Sidebar dışına tıklanınca kapanır
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <RouterLink to="/" className="logo-container">
            <img src={Logo} alt="Logo" className="navbar-logo" />
          </RouterLink>

          {/* Desktop Links */}
          <div className="links-container">
            <RouterLink to="/" className={location.pathname === "/" ? "nav-link active" : "nav-link"}>
              Home
            </RouterLink>
            <RouterLink to="/favori-coinlerim" className={location.pathname === "/favori-coinlerim" ? "nav-link active" : "nav-link"}>
              Star Coins
            </RouterLink>
            <RouterLink to="/favori-kullanicilarim" className={location.pathname === "/favori-kullanicilarim" ? "nav-link active" : "nav-link"}>
             My Favorite Influencers
            </RouterLink>
            <RouterLink to="/en-guvendiklerim" className={location.pathname === "/en-guvendiklerim" ? "nav-link active" : "nav-link"}>
              Crypto Influencers
            </RouterLink>
            <RouterLink to="/average-profits" className={location.pathname === "/average-profits" ? "nav-link active" : "nav-link"}>
              Average Profits/Loss
            </RouterLink>
            <RouterLink to="/news" className={location.pathname === "/news" ? "nav-link active" : "nav-link"}>
              News
            </RouterLink>
          </div>

          {/* Hamburger Menu for Mobile */}
          <FaBars className="hamburger-icon" onClick={toggleSidebar} />
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>

        {/* Sidebar Links */}
        <div className="sidebar-links" onClick={(e) => e.stopPropagation()}>
          <RouterLink to="/" className={location.pathname === "/" ? "sidebar-link active" : "sidebar-link"} onClick={toggleSidebar}>
            <FaHome className="sidebar-icon" /> Home
          </RouterLink>
          <RouterLink to="/favori-coinlerim" className={location.pathname === "/favori-coinlerim" ? "sidebar-link active" : "sidebar-link"} onClick={toggleSidebar}>
            <FaStar className="sidebar-icon" /> Star Coins
          </RouterLink>
          <RouterLink to="/favori-kullanicilarim" className={location.pathname === "/favori-kullanicilarim" ? "sidebar-link active" : "sidebar-link"} onClick={toggleSidebar}>
  <FaHeart className="sidebar-icon" /> My Favorite Influencers
</RouterLink>
          <RouterLink to="/en-guvendiklerim" className={location.pathname === "/en-guvendiklerim" ? "sidebar-link active" : "sidebar-link"} onClick={toggleSidebar}>
            <FaUserFriends className="sidebar-icon" /> Crypto Influencers
          </RouterLink>
          <RouterLink to="/average-profits" className={location.pathname === "/average-profits" ? "sidebar-link active" : "sidebar-link"} onClick={toggleSidebar}>
  <FaChartLine className="sidebar-icon" /> Average Profits/Loss
</RouterLink>
          <RouterLink to="/news" className={location.pathname === "/news" ? "sidebar-link active" : "sidebar-link"} onClick={toggleSidebar}>
            <FaNewspaper className="sidebar-icon" /> News
          </RouterLink>
        </div>
      </div>
    </>
  );
};

export default Navbar;
