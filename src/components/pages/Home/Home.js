// src/components/pages/Home/Home.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';
import CoinIcon from '../../../assets/star.svg'; // Example coin icon
import UserIcon from '../../../assets/user.svg'; // Example user icon
import NewsIcon from '../../../assets/news.png'; // Example news icon
import HomeImage from '../../../assets/home.png'; // Image for the hero section
import CryptoTicker from './CryptoTicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const [highlights, setHighlights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch highlights data from backend
    const fetchHighlights = async () => {
      try {
        const response = await axios.get('https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users/highlights');
        setHighlights(response.data);
      } catch (error) {
        console.error('Error fetching highlights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

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
              Discover the world of gem coins, where high volatility meets high risk, but with the potential for incredible gains. These under-the-radar cryptocurrencies, often promoted by trusted Twitter influencers, can see explosive growth in short periods. By tracking their performance and understanding their market movements, you can capitalize on the most promising opportunities. Stay ahead of the curve by adding your most trusted influencers, and build a portfolio that leverages both high risk and high reward to maximize your crypto investments.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card">
          <img src={UserIcon} alt="Favorite Influencers" className="feature-icon" />
          <h3>Add Your Favorite Influencers</h3>
          <p>Track trusted Twitter influencers and the coins they share. Stay informed on their latest picks and monitor their performance.</p>
          <Link to="/crypto-influencers" className="feature-button">Start</Link>
        </div>

        <div className="feature-card">
          <img src={NewsIcon} alt="News" className="feature-icon" />
          <h3>Stay Updated with the Latest News</h3>
          <p>Follow the most recent developments in the crypto world.</p>
          <Link to="/news" className="feature-button">Explore News</Link>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="highlights-section">
        <h2>Highlights</h2>

        {loading ? (
          <div className="loading-icon">
            <FontAwesomeIcon icon={faSpinner} spin /> {/* Loading icon */}
          </div>
        ) : highlights ? (
          <div className="highlights-grid">
            <div className="highlight-card">
              <img src={UserIcon} alt="Influencer" className="highlight-icon" />
              <h3>Influencer with Highest Average Profit</h3>
              <p>
                Name:{' '}
                <Link to={`/user/${highlights.highestAvgProfitUser._id}`}>
                  {highlights.highestAvgProfitUser.name}
                </Link>
              </p>
              <p>Average Profit: {highlights.highestAvgProfitUser.avgProfit.toFixed(2)}%</p>
            </div>
            <div className="highlight-card">
              <img src={CoinIcon} alt="Coin" className="highlight-icon" />
              <h3>Top Performing Coin</h3>
              <p>
                Coin:{' '}
                {highlights.highestProfitCoin.name} ({highlights.highestProfitCoin.symbol})
              </p>
              <p>Profit: {highlights.highestProfitCoin.profitPercentage.toFixed(2)}%</p>
              <p>
                Shared by:{' '}
                <Link to={`/user/${highlights.highestProfitCoin.userId}`}>
                  {highlights.highestProfitCoin.userName}
                </Link>
              </p>
            </div>
            <div className="highlight-card">
              <img src={UserIcon} alt="Influencer" className="highlight-icon" />
              <h3>Influencer with Most Coins</h3>
              <p>
                Name:{' '}
                <Link to={`/user/${highlights.mostCoinsUser._id}`}>
                  {highlights.mostCoinsUser.name}
                </Link>
              </p>
              <p>Number of Coins: {highlights.mostCoinsUser.coins.length}</p>
            </div>
          </div>
        ) : (
          <p>Error loading highlights</p>
        )}
      </section>
    </div>
  );
};

export default Home;
