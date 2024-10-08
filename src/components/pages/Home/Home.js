// src/components/pages/Home/Home.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import CoinIcon from '../../../assets/star.svg'; // Örnek bir coin ikonu
import UserIcon from '../../../assets/user.svg'; // Örnek bir kullanıcı ikonu
import TrendIcon from '../../../assets/star.svg'; // Örnek bir trend ikonu
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
            <h1>Kripto Dünyasına Adım Atın!</h1>
            <p>
              Twitter fenomenlerinin paylaştığı coinlerin performansını takip edin ve kâr-zarar durumlarını görün. En güvendiğiniz fenomenleri ekleyerek kripto yatırımlarınızı güçlendirin.
            </p>
            <Link to="/en-guvendiklerim" className="hero-button">Hemen Başla</Link>
          </div>
        </div>
      </section>

      {/* Ana Özellikler */}
      <section className="features-section">
        <div className="feature-card">
          <img src={UserIcon} alt="Favori Fenomenler" className="feature-icon" />
          <h3>Favori Fenomenlerinizi Ekleyin</h3>
          <p>En güvendiğiniz Twitter fenomenlerini ekleyin ve paylaştıkları coinleri takip edin.</p>
          <Link to="/en-guvendiklerim" className="feature-button">Başla</Link>
        </div>

        <div className="feature-card">
          <img src={CoinIcon} alt="Coin Performansı" className="feature-icon" />
          <h3>Coin Performansını Takip Edin</h3>
          <p>Coinlerin güncel fiyatlarını ve piyasa değerlerini görün.</p>
          <Link to="/favori-coinlerim" className="feature-button">Keşfet</Link>
        </div>

        <div className="feature-card">
          <img src={TrendIcon} alt="Trendler" className="feature-icon" />
          <h3>En Son Trendleri Görün</h3>
          <p>Kripto dünyasındaki en son trendleri ve haberleri takip edin.</p>
          <Link to="/trendler" className="feature-button">Trendleri İncele</Link>
        </div>
      </section>

      {/* Öne Çıkanlar */}
      <section className="highlights-section">
        <h2>Öne Çıkanlar</h2>
        <div className="highlights-grid">
          <div className="highlight-card">
            <img src={UserIcon} alt="Fenomen" className="highlight-icon" />
            <h3>En Çok Takip Edilen Fenomen</h3>
            <p>@fenomen1</p>
            <Link to="/user/1" className="highlight-button">Profili Gör</Link>
          </div>
          <div className="highlight-card">
            <img src={CoinIcon} alt="Coin" className="highlight-icon" />
            <h3>En Çok Kazandıran Coin</h3>
            <p>Coin XYZ (%150 artış)</p>
            <Link to="/favori-coinlerim" className="highlight-button">Detaylar</Link>
          </div>
          {/* Daha fazla öne çıkan kart ekleyebilirsiniz */}
        </div>
      </section>
    </div>
  );
};

export default Home;
