// src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from './components/pages/Navbar/Navbar';
import FavoriKullanicilarim from "./components/pages/FavoriKullanicilarim/FavoriKullanicilarim";
import EnGuvendiklerim from "./components/pages/Categories/EnGuvendiklerim/EnGuvendiklerim";
import UserPage from "./components/pages/UserPage/UserPage";
import News from "./components/pages/News/News";
import FavoriCoinlerim from "./components/pages/FavoriCoinlerim/FavoriCoinlerim";
import AverageProfits from './components/pages/AverageProfits/AverageProfits';
import Home from './components/pages/Home/Home';
import { UserProvider } from '../src/context/UserContext';
import "./App.css";

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <div className="main-content"> {/* Ana içeriği kapsayan div */}
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/average-profits" element={<AverageProfits />} />
          <Route path="/my-favorite-influencers" element={<FavoriKullanicilarim />} />
          <Route path="/crypto-influencers" element={<EnGuvendiklerim />} />
          <Route path="/user/:id" element={<UserPage />} />
          <Route path="/star-coins" element={<FavoriCoinlerim />} />
          <Route path="/news" element={<News />} />
        </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
