// src/components/Navbar.js

import React, { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // Hamburger and close icons
import Logo from "../../../assets/logo.png";
import "./Navbar.css"; // Import the external CSS

const Navbar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      <nav className="navbar">
        {/* Logo and Links Container */}
        <div className="navbar-content">
          <RouterLink to="/" className="logo-container">
            <img src={Logo} alt="Logo" className="navbar-logo" />
          </RouterLink>

          {/* Desktop Links */}
          <div className="links-container">
          <RouterLink
              to="/"
              className={location.pathname === "/" ? "nav-link active" : "nav-link"}
            >
              Home
            </RouterLink>
            <RouterLink
              to="/favori-kullanicilarim"
              className={location.pathname === "/favori-kullanicilarim" ? "nav-link active" : "nav-link"}
            >
             Favorite Influencers
            </RouterLink>
            <RouterLink
              to="/favori-coinlerim"
              className={location.pathname === "/favori-coinlerim" ? "nav-link active" : "nav-link"}
            >
             Star Coins
            </RouterLink>
            <RouterLink
              to="/en-guvendiklerim"
              className={location.pathname === "/en-guvendiklerim" ? "nav-link active" : "nav-link"}
            >
             Crypto Influencers
            </RouterLink>
         
            <RouterLink
              to="/news"
              className={location.pathname === "/news" ? "nav-link active" : "nav-link"}
            >
              News
            </RouterLink>
          </div>

          {/* Hamburger Menu for Mobile */}
          <FaBars className="hamburger-icon" onClick={toggleSidebar} />
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Close Icon */}
        <FaTimes className="close-icon" onClick={toggleSidebar} />

        {/* Sidebar Links */}
        <div className="sidebar-links">
        <RouterLink
            to="/"
            className={location.pathname === "/" ? "sidebar-link active" : "sidebar-link"}
            onClick={toggleSidebar}
          >
           Home
          </RouterLink>
          <RouterLink
            to="/favori-kullanicilarim"
            className={location.pathname === "/favori-kullanicilarim" ? "sidebar-link active" : "sidebar-link"}
            onClick={toggleSidebar}
          >
           Favorite Influencers
          </RouterLink>
          <RouterLink
              to="/favori-coinlerim"
              className={location.pathname === "/favori-coinlerim" ? "sidebar-link active" : "sidebar-link"}
              onClick={toggleSidebar}
            >
              Favori Coinlerim
            </RouterLink>
          <RouterLink
            to="/en-guvendiklerim"
            className={location.pathname === "/en-guvendiklerim" ? "sidebar-link active" : "sidebar-link"}
            onClick={toggleSidebar}
          >
         Crypto Influencers
          </RouterLink>
          <RouterLink
            to="/news"
            className={location.pathname === "/news" ? "sidebar-link active" : "sidebar-link"}
            onClick={toggleSidebar}
          >
            News
          </RouterLink>
        </div>
      </div>
    </>
  );
};

export default Navbar;
