// src/components/pages/UserPage/UserPage.js

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import DexScreenerIcon from "../../../assets/dexscreener.png";
import AddCoinModal from "./AddCoinModal";
import { useUserPage } from "./useUserPage"; // Hook'u import ediyoruz
import { formatPriceWithConditionalZeros, formatMarketCap } from "./Utils"; // Import ediyoruz
import "./UserPage.css";

const UserPage = () => {
  const { id } = useParams();

  // Hook'tan dönen veriler ve fonksiyonlar
  const {
    user,
    coins,
    loading,
    error,
    flipped,
    handleFlip,
    handleDeleteCoin,
    handleAddCoin,
    sortCriteria,
    setSortCriteria,
    sortOrder, // Sıralama yönü
    setSortOrder, // Sıralama yönünü değiştirme fonksiyonu
    selectedNetwork,
    setSelectedNetwork,
    defaultImage,
    getTwitterUsername,
    allNetworks,
  } = useUserPage(id);

  const [showAddCoinModal, setShowAddCoinModal] = useState(false);

  if (loading) {
    return <p>Yükleniyor...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Sıralama yönünü simgeye tıklayarak değiştirme
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const twitterUsername = getTwitterUsername(user.twitter);
  const profileImageUrl = twitterUsername
    ? `https://unavatar.io/twitter/${twitterUsername}`
    : null;

  return (
    <div className="coin-container">
      {/* Başlık Bölümü */}
      <div className="header">
        <div className="user-info">
          {profileImageUrl && (
            <a href={user.twitter} target="_blank" rel="noopener noreferrer">
              <img
                src={profileImageUrl}
                alt={`${user.name} profil resmi`}
                className="twitter-profile-image"
              />
            </a>
          )}
          <h1 className="user-name">{user.name}</h1>
        </div>

        <div className="add-coin-and-twitter">
          <button
            className="add-coin-button"
            onClick={() => setShowAddCoinModal(true)}
          >
            <span className="desktop-text">Ekle</span>
            <span className="mobile-text">+</span>
          </button>
        </div>
      </div>

      {/* Sıralama ve Filtreleme Kontrolleri */}
      <div className="controls">
        <div className="filter-section">
          <label htmlFor="sortCriteria">Sırala: </label>
          <span
            className="sort-icon-container"
            onClick={toggleSortOrder}
            title={sortOrder === "asc" ? "Artan sıralama" : "Azalan sıralama"} // İkona hover yapıldığında gösterilecek açıklama
          >
            {sortOrder === "asc" ? (
              <i className="fas fa-sort-amount-up-alt"></i> // Artan sıralama ikonu
            ) : (
              <i className="fas fa-sort-amount-down-alt"></i> // Azalan sıralama ikonu
            )}
          </span>
          <select
            id="sortCriteria"
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value)}
          >
            <option value="">Sıralama Kriteri Seçin</option>
            <option value="shareDate">Paylaşım Tarihine Göre</option>
            <option value="profitPercentage">Kazanç Yüzdesine Göre</option>
            <option value="currentMarketCap">Güncel MarketCap'e Göre</option>
          </select>
        

          <label htmlFor="networkFilter">Ağa Göre: </label>
          <select
            id="networkFilter"
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
          >
            <option value="">Tüm Ağlar</option>
            {allNetworks.map((network) => (
              <option key={network} value={network}>
                {network}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Coin Modal */}
      {showAddCoinModal && (
        <AddCoinModal
          onAddCoin={handleAddCoin}
          onClose={() => setShowAddCoinModal(false)}
        />
      )}

      {/* Coin Listesi */}
      <div className="coin-grid">
        {coins.map((coin, index) => (
          <div
            key={coin._id}
            className={`card ${flipped[index] ? "flipped" : ""}`}
            onClick={() => handleFlip(index)}
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleFlip(index);
            }}
            role="button"
            aria-pressed={flipped[index]}
          >
            {/* Ön Yüz */}
            <div className="card-inner">
              <div className="card-front">
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCoin(coin._id);
                  }}
                >
                  ❌
                </button>
                <img
                  src={coin.imageUrl}
                  alt={coin.name}
                  className="coin-image"
                  onError={(e) => (e.target.src = defaultImage)}
                />
                <h3>
                  {coin.name} ({coin.symbol})
                </h3>
                <p
                  className={`market-cap-comparison ${
                    coin.marketCapComparison >= 0 ? "positive" : "negative"
                  }`}
                >
                  {coin.marketCapComparison}%
                </p>
                <div className="network-row network-bottom">
                  <div className="network-item">
                    <p className="info-value">({coin.network})</p>
                  </div>
                </div>
                <a
                  href={coin.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dex-screener-link"
                >
                  <img
                    src={DexScreenerIcon}
                    alt="Dex Screener"
                    className="dex-screener-icon"
                  />
                </a>
              </div>

              {/* Arka Yüz */}
              <div className="card-back">
                {/* Detaylar */}
                <div className="info-section">
                  {/* Tarihler */}
                  <div className="dates-row">
                    <div className="date-item">
                      <p className="info-label">Paylaşım Tarihi:</p>
                      <p className="info-value">
                        {new Date(coin.shareDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="date-item">
                      <p className="info-label">Güncel Tarih:</p>
                      <p className="info-value">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Fiyatlar */}
                  <div className="prices-row">
                    <div className="price-item">
                      <p className="info-label">Paylaşım Fiyatı:</p>
                      <p className="info-value">
                        {coin.sharePrice
                          ? formatPriceWithConditionalZeros(coin.sharePrice)
                          : "Yükleniyor"}
                      </p>
                    </div>
                    <div className="price-item">
                      <p className="info-label">Güncel Fiyat:</p>
                      <p className="info-value">
                        {coin.currentPrice
                          ? formatPriceWithConditionalZeros(coin.currentPrice)
                          : "Yükleniyor"}
                      </p>
                    </div>
                  </div>

                  {/* Piyasa Değerleri */}
                  <div className="marketcap-row">
                    <div className="marketcap-item">
                      <p className="info-label">Paylaşım Piyasa Değeri:</p>
                      <p className="info-value">
                        {coin.shareMarketCap
                          ? formatMarketCap(coin.shareMarketCap)
                          : "Yükleniyor"}
                      </p>
                    </div>
                    <div className="marketcap-item">
                      <p className="info-label">Güncel Piyasa Değeri:</p>
                      <p className="info-value">
                        {coin.currentMarketCap
                          ? formatMarketCap(coin.currentMarketCap)
                          : "Yükleniyor"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPage;
