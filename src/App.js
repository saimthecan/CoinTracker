import React, { useEffect } from "react";
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
import Login from "./components/Auth/Login";
import SignUp from "./components/Auth/SignUp";
import store from "./ReduxToolkit/store";
import { setUser, clearUser, setAuthLoading  } from './ReduxToolkit/userSlice';
import { jwtDecode } from 'jwt-decode';
import "./App.css";
import ScrollToTop from './ScrollToTop'; 

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

// Korumalı rota (Protected Route) bileşeni
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, isLoading } = useSelector((state) => state.user);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(setAuthLoading(true)); // isLoading'i true yapıyoruz
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      try {
        // Token'ı çöz ve geçerliliğini kontrol et
        const decodedToken = jwtDecode(userData.token);
        const currentTime = Date.now() / 1000; // Şu anki zaman (saniye cinsinden)
        if (decodedToken.exp > currentTime) {
          // Token geçerli, kullanıcıyı ayarla
          dispatch(setUser(userData));
        } else {
          // Token süresi dolmuş, kullanıcıyı çıkış yap
          dispatch(clearUser());
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Token çözülürken hata oluştu:', error);
        // Token geçersizse kullanıcıyı çıkış yap
        dispatch(clearUser());
        localStorage.removeItem('user');
      }
    } else {
      dispatch(clearUser());
    }
    dispatch(setAuthLoading(false)); // isLoading'i false yapıyoruz
  }, [dispatch]);

  if (isLoading) {
    
    // Kullanıcı oturum durumu belirlenene kadar bir yükleniyor ekranı gösterebilirsiniz
    return <div>Loading...</div>;
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
