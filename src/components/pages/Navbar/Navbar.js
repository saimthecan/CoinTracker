import React, { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaStar,
  FaUserFriends,
  FaNewspaper,
  FaChartLine,
  FaHeart,
  FaSignOutAlt,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../../ReduxToolkit/userSlice"; // Çıkış işlemi için
import Logo from "../../../assets/logo.png";
import "./Navbar.css"; // Import the external CSS

const Navbar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown menü için
  const dropdownRef = useRef(null); // Dropdown referansı
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux'tan kullanıcı bilgilerini alma
  const { user, isAuthenticated, role } = useSelector((state) => state.user);

  const toggleSidebar = (e) => {
    e.stopPropagation();
    setSidebarOpen((prev) => !prev);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    // Kullanıcı çıkış işlemi
    dispatch(logoutUser());
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open-body");
    } else {
      document.body.classList.remove("sidebar-open-body");
    }
  }, [sidebarOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".sidebar") && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [sidebarOpen]);

  // Dış tıklama ile dropdown kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false); // Eğer tıklanan element dropdown değilse menüyü kapat
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Mouse tıklamalarını dinle
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Olay dinleyicisini kaldır
    };
  }, [dropdownRef]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
              {/* Hamburger Menu for Mobile */}
              <FaBars className="hamburger-icon" onClick={toggleSidebar} /> 


          {/* Sola Yapışık Logo */}
          <RouterLink to="/" className="logo-container">
            <img src={Logo} alt="Logo" className="navbar-logo" />
          </RouterLink>

          {/* Sola Yapışık Linkler */}
          <div className="links-container">
            <RouterLink
              to="/"
              className={
                location.pathname === "/" ? "nav-link active" : "nav-link"
              }
            >
              Home
            </RouterLink>
            {isAuthenticated && (
              <>
                <RouterLink
                  to="/star-coins"
                  className={
                    location.pathname === "/star-coins"
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                  Star Coins
                </RouterLink>
                <RouterLink
                  to="/my-favorite-influencers"
                  className={
                    location.pathname === "/my-favorite-influencers"
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                  My Favorite Influencers
                </RouterLink>
                {role === "appUser" && (
                  <RouterLink
                    to="/AppUser-influencers"
                    className={location.pathname === "/AppUser-influencers" ? "nav-link active" : "nav-link"}
                  >
                    My Influencers
                  </RouterLink>
                )}
                <RouterLink
                  to="/admin-influencers"
                  className={
                    location.pathname === "/admin-influencers"
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                  Admin Influencers
                </RouterLink>

                <RouterLink
                  to="/coininsights"
                  className={
                    location.pathname === "/coininsights"
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                 Coin Insights
                </RouterLink>

                <RouterLink
                  to="/latest"
                  className={
                    location.pathname === "/latest"
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                  Latest
                </RouterLink>
             
                <RouterLink
                  to="/average-profits"
                  className={
                    location.pathname === "/average-profits"
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                  Average Profits/Loss
                </RouterLink>
              </>
            )}
            <RouterLink
              to="/news"
              className={
                location.pathname === "/news" ? "nav-link active" : "nav-link"
              }
            >
              News
            </RouterLink>
          </div>

          {/* Sağda Login ve Signup Butonları veya Kullanıcı Avatarı */}
          {isAuthenticated ? (
            <div className="user-avatar-container" ref={dropdownRef}>
              <div className="user-avatar" onClick={toggleDropdown}>
                {user.charAt(0).toUpperCase()}
              </div>

              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="navbar-user-info">
                    <div className="user-avatar-large">
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <span className="username">{user}</span>
                  </div>
                  <div className="user-dropdown-item" onClick={handleLogout}>
                    <span>Logout</span>
                    <FaSignOutAlt className="logout-icon" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <RouterLink to="/signup" className="auth-button">
               Join Free
              </RouterLink>
              <RouterLink to="/login" className="auth-button">
                Log In
              </RouterLink>
            </div>
          )}

    
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-links" onClick={(e) => e.stopPropagation()}>
          <RouterLink
            to="/"
            className={
              location.pathname === "/" ? "sidebar-link active" : "sidebar-link"
            }
            onClick={toggleSidebar}
          >
            <FaHome className="sidebar-icon" /> Home
          </RouterLink>
          {isAuthenticated && (
            <>
              <RouterLink
                to="/star-coins"
                className={
                  location.pathname === "/star-coins"
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
                onClick={toggleSidebar}
              >
                <FaStar className="sidebar-icon" /> Star Coins
              </RouterLink>
              <RouterLink
                to="/my-favorite-influencers"
                className={
                  location.pathname === "/my-favorite-influencers"
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
                onClick={toggleSidebar}
              >
                <FaHeart className="sidebar-icon" /> My Favorite Influencers
              </RouterLink>
              {role === "appUser" && (
                <RouterLink
                  to="/AppUser-influencers"
                  className={location.pathname === "/AppUser-influencers" ? "sidebar-link active" : "sidebar-link"}
                  onClick={toggleSidebar}
                >
                  <FaUserFriends className="sidebar-icon" /> My Influencers
                </RouterLink>
              )}
              <RouterLink
                to="/admin-influencers"
                className={
                  location.pathname === "/admin-influencers"
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
                onClick={toggleSidebar}
              >
                <FaUserFriends className="sidebar-icon" /> Admin Influencers
              </RouterLink>

              <RouterLink
                to="/coininsights"
                className={
                  location.pathname === "/coininsights"
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
                onClick={toggleSidebar}
              >
                <FaUserFriends className="sidebar-icon" /> Coin Insights
              </RouterLink>

              <RouterLink
                to="/latest"
                className={
                  location.pathname === "/latest"
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
                onClick={toggleSidebar}
              >

                

                

                
                <FaChartLine className="sidebar-icon" /> Latest
              </RouterLink>
          
              <RouterLink
                to="/average-profits"
                className={
                  location.pathname === "/average-profits"
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
                onClick={toggleSidebar}
              >
                <FaChartLine className="sidebar-icon" /> Average Profits/Loss
              </RouterLink>
            </>
          )}
          <RouterLink
            to="/news"
            className={
              location.pathname === "/news"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={toggleSidebar}
          >
            <FaNewspaper className="sidebar-icon" /> News
          </RouterLink>
        </div>
      </div>
    </>
  );
};

export default Navbar;
