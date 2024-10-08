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
          <RouterLink to="/favori-kullanicilarim" className="logo-container">
            <img src={Logo} alt="Logo" className="navbar-logo" />
          </RouterLink>

          {/* Desktop Links */}
          <div className="links-container">
            <RouterLink
              to="/favori-kullanicilarim"
              className={location.pathname === "/favori-kullanicilarim" ? "nav-link active" : "nav-link"}
            >
              Favori Kullanıcılarım
            </RouterLink>
            <RouterLink
              to="/favori-coinlerim"
              className={location.pathname === "/favori-coinlerim" ? "nav-link active" : "nav-link"}
            >
              Favori Coinlerim
            </RouterLink>
            <RouterLink
              to="/en-guvendiklerim"
              className={location.pathname === "/en-guvendiklerim" ? "nav-link active" : "nav-link"}
            >
              En Güvendiklerim
            </RouterLink>
            <RouterLink
              to="/guvendiklerim"
              className={location.pathname === "/guvendiklerim" ? "nav-link active" : "nav-link"}
            >
              Güvendiklerim
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
            to="/favori-kullanicilarim"
            className={location.pathname === "/favori-kullanicilarim" ? "sidebar-link active" : "sidebar-link"}
            onClick={toggleSidebar}
          >
            Favori Kullanıcılarım
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
            En Güvendiklerim
          </RouterLink>
          <RouterLink
            to="/guvendiklerim"
            className={location.pathname === "/guvendiklerim" ? "sidebar-link active" : "sidebar-link"}
            onClick={toggleSidebar}
          >
            Güvendiklerim
          </RouterLink>
        </div>
      </div>
    </>
  );
};

export default Navbar;
