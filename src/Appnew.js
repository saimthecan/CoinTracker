import React, { useEffect } from "react";
import { CssBaseline, CircularProgress, Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles"; 
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"; // Navigate kullanarak yönlendirme yapacağız
import { Provider, useDispatch, useSelector } from "react-redux"; // useSelector eklendi
import Navbar from './components/pages/Navbar/Navbar';
import FavoriKullanicilarim from "./components/pages/FavoriKullanicilarim/FavoriKullanicilarim";
import AdminInfluencer from "./components/pages/Categories/AdminInfluencer/AdminInfluencer";
import AppUser from "./components/pages/Categories/AppUser/AppUser";
import UserPage from "./components/pages/UserPage/UserPage";
import News from "./components/pages/News/News";
import FavoriCoinlerim from "./components/pages/FavoriCoinlerim/FavoriCoinlerim";
import AverageProfits from './components/pages/AverageProfits/AverageProfits';
import Home from './components/pages/Home/Home';
import Latest from './components/pages/Latest/Latest';
import Login from "./components/Auth/Login";
import SignUp from "./components/Auth/SignUp";
import store from "./ReduxToolkit/store";
import { setUser, clearUser, setAuthLoading  } from './ReduxToolkit/userSlice';
import { jwtDecode } from 'jwt-decode';
import "./App.css";
import ScrollToTop from './ScrollToTop'; 

const theme = createTheme();

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Provider store={store}>
      <AppContent />
    </Provider>
    </ThemeProvider>
  );
};

// Korumalı rota (Protected Route) bileşeni
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, isLoading } = useSelector((state) => state.user);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
        <h2>Access Denied: You do not have the required permissions.</h2>
        <Navigate to="/login" />
      </Box>
    );
  }
  

  return children;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.user);

  // checkTokenValidity fonksiyonunu burada tanımlıyoruz
  const checkTokenValidity = (dispatch) => {
    const storedUserData = localStorage.getItem('user'); // LocalStorage'dan kullanıcı verisini al
    if (storedUserData) {
      const userData = JSON.parse(storedUserData); // JSON formatını çöz
      try {
        const decodedToken = jwtDecode(userData.token); // Token'ı çözümle
        const currentTime = Date.now() / 1000; // Şu anki zaman (saniye cinsinden)
        if (decodedToken.exp > currentTime) {
          // Token hala geçerliyse kullanıcıyı Redux state'e ayarla
          dispatch(setUser(userData));
        } else {
          // Token süresi dolmuşsa kullanıcıyı çıkış yap
          dispatch(clearUser());
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Token çözülürken hata oluştu:', error);
        dispatch(clearUser()); // Token geçersizse çıkış yap
        localStorage.removeItem('user');
      }
    } else {
      dispatch(clearUser()); // Kullanıcı oturumu yoksa çıkış yap
    }
  };

  // useEffect ile token kontrolü yapıyoruz
  useEffect(() => {
    dispatch(setAuthLoading(true)); // Yükleme durumunu başlat
    checkTokenValidity(dispatch); // Kullanıcı oturumunu kontrol et
    dispatch(setAuthLoading(false)); // Yükleme durumunu sonlandır
  }, [dispatch]);

  // Eğer isLoading durumu aktifse CircularProgress gösteriyoruz
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Korumalı rotalar */}
          <Route path="/my-favorite-influencers" element={<ProtectedRoute><FavoriKullanicilarim /></ProtectedRoute>} />
          <Route path="/admin-influencers" element={<ProtectedRoute><AdminInfluencer /></ProtectedRoute>} />
          <Route path="/AppUser-influencers" element={<ProtectedRoute><AppUser /></ProtectedRoute>} />
          <Route path="/latest" element={<ProtectedRoute><Latest /></ProtectedRoute>} />
          <Route path="/average-profits" element={<ProtectedRoute><AverageProfits /></ProtectedRoute>} />
          <Route path="/star-coins" element={<ProtectedRoute><FavoriCoinlerim /></ProtectedRoute>} />
          <Route path="/user/:id" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
          <Route path="/news" element={<News />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
