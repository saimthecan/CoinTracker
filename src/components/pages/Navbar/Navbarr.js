import React, { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // Hamburger ve kapatma iconları
import btcLogo from "../../../assets/btc.png";

const Navbar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fontStyle = {
    fontSize: "16px",
    fontFamily: "Inter, sans-serif",
    textDecoration: "none",
    color: "#8c8cb1",
    fontWeight: 500,
    marginRight: "12px",
  };

  const selectedLinkStyle = {
    ...fontStyle,
    color: "teal",
  };

  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "#f0f0f0",
    color: "black",
    width: "100%",
  };

  const logoContainerStyle = {
    display: "flex",
    alignItems: "center",
  };

  const linksContainerStyle = {
    display: "flex",
    alignItems: "center",
    marginLeft: "20px",
    justifyContent: "flex-start",
    flexGrow: 1, // Yazıları sola hizala
  };

  const hamburgerStyle = {
    fontSize: "24px",
    cursor: "pointer",
    display: "none",
    paddingRight: "50px " // Başlangıçta gizli, mobilde gösterilecek
  };

  const sidebarStyle = {
    position: "fixed",
    top: 0,
    right: sidebarOpen ? 0 : "-100%",
    width: "250px",
    height: "100%",
    backgroundColor: "#fff",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
    transition: "right 0.3s ease-in-out",
    padding: "2rem",
    zIndex: 1000,
  };

  const sidebarLinksStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "16px",
  };

  const closeIconStyle = {
    alignSelf: "flex-end",
    cursor: "pointer",
    marginBottom: "2rem",
  };

  return (
    <>
      <nav style={navStyle}>
        {/* Logo solda */}
        <div style={logoContainerStyle}>
          <RouterLink to="/">
            <img
              src={btcLogo}
              alt="Logo"
              style={{ width: "50px", height: "50px" }}
            />
          </RouterLink>
        </div>

        {/* Linkler - Masaüstü görünümü için */}
        <div style={linksContainerStyle} className="linksContainerStyle">
          <RouterLink
            to="/"
            style={location.pathname === "/" ? selectedLinkStyle : fontStyle}
          >
            Home
          </RouterLink>
          <RouterLink
            to="/en-guvendiklerim"
            style={
              location.pathname === "/en-guvendiklerim"
                ? selectedLinkStyle
                : fontStyle
            }
          >
            En Güvendiklerim
          </RouterLink>
          <RouterLink
            to="/guvendiklerim"
            style={
              location.pathname === "/guvendiklerim"
                ? selectedLinkStyle
                : fontStyle
            }
          >
            Güvendiklerim
          </RouterLink>
        
        </div>

        {/* Hamburger menüsü - Mobil görünümü için */}
        <FaBars style={hamburgerStyle} className="hamburgerStyle" onClick={toggleSidebar} />
      </nav>

      {/* Sidebar menüsü */}
      <div style={sidebarStyle}>
        {/* Kapatma ikonu */}
        <FaTimes style={closeIconStyle} onClick={toggleSidebar} />

        <div style={sidebarLinksStyle}>
          <RouterLink
            to="/"
            style={location.pathname === "/" ? selectedLinkStyle : fontStyle}
            onClick={toggleSidebar}
          >
            Home
          </RouterLink>
          <RouterLink
            to="/en-guvendiklerim"
            style={
              location.pathname === "/en-guvendiklerim"
                ? selectedLinkStyle
                : fontStyle
            }
            onClick={toggleSidebar}
          >
            En Güvendiklerim
          </RouterLink>
          <RouterLink
            to="/guvendiklerim"
            style={
              location.pathname === "/guvendiklerim"
                ? selectedLinkStyle
                : fontStyle
            }
            onClick={toggleSidebar}
          >
            Güvendiklerim
          </RouterLink>
        
        </div>
      </div>

      <style jsx="true">{`
        /* Masaüstü için linkleri göster, hamburger menüsünü gizle */
        @media (min-width: 768px) {
          .linksContainerStyle {
            display: flex !important;
            justify-content: flex-start !important; /* Sola hizala */
          }
          .hamburgerStyle {
            display: none !important;
          }
        }

        /* Mobil görünümde hamburger menüsü göster */
        @media (max-width: 767px) {
          .linksContainerStyle {
            display: none !important;
          }
          .hamburgerStyle {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

