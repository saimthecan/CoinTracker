// src/components/pages/Home/Home.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';
import CoinIcon from '../../../assets/star.svg';
import UserIcon from '../../../assets/user.svg';
import NewsIcon from '../../../assets/news.png';
import HomeImage from '../../../assets/home.png';
import Highlights from '../../../assets/highlights.png';
import CryptoTicker from './CryptoTicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux";

const Home = () => {

  const [highlights, setHighlights] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.user);
  
  useEffect(() => {
    const fetchHighlights = async () => {
      setLoading(true);
      try {
        // Token'ı ve kullanıcı ID'sini localStorage'dan alıyoruz
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = storedUser ? storedUser.token : null;
        const appUserId = user.userId

       

        // Dinamik olarak URL'yi oluşturuyoruz
        const url = `https://cointracker-backend-7786c0daa55a.herokuapp.com/appUser/${appUserId}/influencers/highlights`;

        // Yetkilendirme başlığı ile birlikte isteği yapıyoruz
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHighlights(response.data);
      } catch (error) {
        console.error('Error fetching highlights:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHighlights();
  }, [user.userId]);


  return (
    <div className="home-container">
      <CryptoTicker />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-image">
            <img src={HomeImage} alt="Coin Tracker" />
          </div>
          <div className="hero-text">
            <h1>Step into the Gem Market!</h1>
            <p>
              Discover the world of gem coins, where high volatility meets high risk, but with the potential for incredible gains. These under-the-radar cryptocurrencies, often promoted by trusted Twitter influencers, can see explosive growth in short periods. By tracking their performance and understanding their market movements, you can capitalize on the most promising opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card">
          <img src={UserIcon} alt="Favorite Influencers" className="feature-icon" />
          <h3>Add Your Favorite Influencers</h3>
          <p>Track trusted Twitter influencers and the coins they share.</p>
          <Link to="/AppUser-influencers" className="feature-button">Start</Link>
        </div>

        <div className="feature-card">
          <img src={NewsIcon} alt="News" className="feature-icon" />
          <h3>Stay Updated with the Latest News</h3>
          <p>Follow the most recent developments in the crypto world.</p>
          <Link to="/news" className="feature-button">Explore News</Link>
        </div>
      </section>

        {/* Highlights Section - Yalnızca Giriş Yapmış Kullanıcılar İçin */}
        {user &&  (
        <section className="highlights-section">
          <h2>Highlights</h2>

          {loading ? (
            <div className="loading-icon">
              <FontAwesomeIcon icon={faSpinner} spin />
            </div>
          ) : highlights ? (
            <div className="highlights-grid">
           {highlights.highestAvgProfitUser && (
  <div className="highlight-card">
    <img src={UserIcon} alt="Influencer" className="highlight-icon" />
    <h3>Influencer with Highest Average Profit</h3>
    <p>
      Name: <Link to={`/user/${highlights.highestAvgProfitUser._id}`}>
        {highlights.highestAvgProfitUser.name}
      </Link>
    </p>
    <p>Average Profit: {highlights.highestAvgProfitUser.avgProfit.toFixed(2)}%</p>
  </div>
)}

{highlights.highestProfitCoin && (
  <div className="highlight-card">
    <img src={CoinIcon} alt="Coin" className="highlight-icon" />
    <h3>Top Performing Coin</h3>
    <p>Coin: {highlights.highestProfitCoin.name} ({highlights.highestProfitCoin.symbol})</p>
    <p>Profit: {highlights.highestProfitCoin.profitPercentage.toFixed(2)}%</p>
  </div>
)}

{highlights.mostCoinsInfluencer && (
  <div className="highlight-card">
    <img src={UserIcon} alt="Influencer" className="highlight-icon" />
    <h3>Influencer with Most Coins</h3>
    <p>Name: <Link to={`/user/${highlights.mostCoinsInfluencer._id}`}>{highlights.mostCoinsInfluencer.name}</Link></p>
    <p>Number of Coins: {highlights.mostCoinsInfluencer.coinCount}</p>
  </div>
)}

            </div>
          ) : (
            <section className="login-prompt-section">
            <p>Please log in to view personalized highlights and insights.</p>
            <img src={Highlights} alt="Login Prompt" className="login-prompt-image" />
          </section>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
