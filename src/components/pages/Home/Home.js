// src/components/pages/Home/Home.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import CoinIcon from '../../../assets/star.svg'; // Örnek bir coin ikonu
import UserIcon from '../../../assets/user.svg'; // Örnek bir kullanıcı ikonu
import News from '../../../assets/news.png'; // Örnek bir trend ikonu
import HomeImage from '../../../assets/home.png'; // Sol tarafa eklenecek resim
import CryptoTicker from './CryptoTicker';

const Home = () => {
  return (
    <div className="home-container">
    <CryptoTicker />

      {/* Hero Bölümü */}
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

      {/* Ana Özellikler */}
      <section className="features-section">
        <div className="feature-card">
          <img src={UserIcon} alt="Favori Fenomenler" className="feature-icon" />
          <h3>Add Your Favorite Influencers</h3>
          <p>Track trusted Twitter influencers and the coins they share. Stay informed on their latest picks and monitor their performance.</p>
          <Link to="/en-guvendiklerim" className="feature-button">Start</Link>
        </div>


        <div className="feature-card">
          <img src={News} alt="Trendler" className="feature-icon" />
          <h3>Stay Updated with the Latest News</h3>
          <p>Follow the most recent developments in the crypto world..</p>
          <Link to="/news" className="feature-button">Explore News</Link>
        </div>
      </section>

      {/* Öne Çıkanlar */}
      <section className="highlights-section">
        <h2>Highlights</h2>
        <div className="highlights-grid">
          <div className="highlight-card">
            <img src={UserIcon} alt="Fenomen" className="highlight-icon" />
            <h3>Most Followed Influencer</h3>
            <p>@user</p>
            <Link to="/user/1" className="highlight-button">View Profile</Link>
          </div>
          <div className="highlight-card">
            <img src={CoinIcon} alt="Coin" className="highlight-icon" />
            <h3>Top Performing Coin</h3>
            <p>Coin XYZ (%150 Increase)</p>
            <Link to="/favori-coinlerim" className="highlight-button">Details</Link>
          </div>
          {/* Daha fazla öne çıkan kart ekleyebilirsiniz */}
        </div>
      </section>
    </div>
  );
};

export default Home;
