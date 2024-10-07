// src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from './components/pages/Navbar/Navbar';
import Home from "./components/pages/HomePage/Home";
import EnGuvendiklerim from "./components/pages/Categories/EnGuvendiklerim/EnGuvendiklerim";
import Guvendiklerim from "./components/pages/Categories/Guvendiklerim/Guvendiklerim";
import UserPage from "./components/pages/UserPage/UserPage";
import FavoriCoinlerim from "./components/pages/FavoriCoinlerim/FavoriCoinlerim";
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
          <Route path="/en-guvendiklerim" element={<EnGuvendiklerim />} />
          <Route path="/guvendiklerim" element={<Guvendiklerim />} />
          <Route path="/user/:id" element={<UserPage />} />
          <Route path="/favori-coinlerim" element={<FavoriCoinlerim />} />
        </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
