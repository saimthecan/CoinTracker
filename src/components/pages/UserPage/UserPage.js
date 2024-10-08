// src/components/pages/UserPage/UserPage.js

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import DexScreenerIcon from "../../../assets/dexscreener.png";
import AddCoinModal from "./AddCoinModal";
import EditCoinModal from "./EditCoinModal"; // EditCoinModal'ı import ediyoruz
import { useUserPage } from "./useUserPage"; // Hook'u import ediyoruz
import { formatPriceWithConditionalZeros, formatMarketCap } from "./Utils"; // Import ediyoruz
import Pagination from "../../../Pagination/Pagination";
import "./UserPage.css";
import StarIcon from "../../../StarIcons/StarIcon"; // Yıldız ikonunun yolu
import EmptyStarIcon from "../../../StarIcons/EmptyStarIcon"; // Boş yıldız ikonunun yolu

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
    handleUpdateCoin, // Düzenleme fonksiyonu
    handleToggleFavoriteCoin,
    sortCriteria,
    setSortCriteria,
    sortOrder,
    setSortOrder,
    selectedNetwork,
    setSelectedNetwork,
    defaultImage,
    getTwitterUsername,
    allNetworks,
  } = useUserPage(id);

  const [showAddCoinModal, setShowAddCoinModal] = useState(false);
  const [coinBeingEdited, setCoinBeingEdited] = useState(null); // Düzenlenen coin'in state'i

  // Pagination için state
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 20; // Her sayfada gösterilecek coin sayısı

  // Coins'in gösterileceği sayfalara göre bölünmesi
  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = coins.slice(indexOfFirstCoin, indexOfLastCoin);

  // Sayfa değişimi fonksiyonu
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Pagination'ın gösterilip gösterilmediğini takip eden state
  const [isPaginationVisible, setIsPaginationVisible] = useState(false);

  if (loading) {
    return <p>Yükleniyor...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Toplam sayfa sayısını hesapla
  const totalPages = Math.ceil(coins.length / coinsPerPage);

  // Sıralama yönünü simgeye tıklayarak değiştirme
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const twitterUsername = getTwitterUsername(user.twitter);
  const profileImageUrl = twitterUsername
    ? `https://unavatar.io/twitter/${twitterUsername}`
    : null;

  // Düzenleme işlemini başlatan fonksiyon
  const handleEditCoin = (coin) => {
    setCoinBeingEdited(coin);
  };

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
            className={`add-coin-button ${
              isPaginationVisible ? "with-pagination" : ""
            }`}
            onClick={() => setShowAddCoinModal(true)}
          >
            <span className="desktop-text">Add</span>
            <span className="mobile-text">+</span>
          </button>
        </div>
      </div>

      {/* Sıralama ve Filtreleme Kontrolleri */}
      <div className="controls">
        <div className="filter-section">
        <label htmlFor="sortCriteria">Sort: </label>

          <span
            className={`sort-icon-container ${
              sortCriteria === "" ? "hide-mobile" : ""
            }`}
            onClick={toggleSortOrder}
            title={sortOrder === "asc" ? "Artan sıralama" : "Azalan sıralama"}
          >
            {sortOrder === "asc" ? (
              <i className="fas fa-sort-amount-up-alt"></i>
            ) : (
              <i className="fas fa-sort-amount-down-alt"></i>
            )}
          </span>

          <select
            id="sortCriteria"
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value)}
          >
           <option value="">Select Sorting Criteria</option>
      <option value="shareDate">By Share Date</option>
      <option value="profitPercentage">By Profit Percentage</option>
      <option value="currentMarketCap">By Current MarketCap</option>
          </select>

          <label htmlFor="networkFilter">By Network: </label>
          <select
            id="networkFilter"
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
          >
            <option value="">All Chains</option>
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

      {/* Edit Coin Modal */}
      {coinBeingEdited && (
        <EditCoinModal
          coin={coinBeingEdited}
          onUpdateCoin={handleUpdateCoin}
          onClose={() => setCoinBeingEdited(null)}
        />
      )}

      {/* Coin Listesi */}
      <div className="coin-grid">
        {currentCoins.map((coin, index) => (
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

                {/* Düzenle Butonu */}
                <button
                  className="edit-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCoin(coin);
                  }}
                >
                  ✏️
                </button>

                {/* Yıldız İkonu - Sağ Alt Köşeye Eklenecek */}
                <button
                  className="favorite-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavoriteCoin(coin._id, coin.isFavorite);
                  }}
                >
                  {coin.isFavorite ? <StarIcon /> : <EmptyStarIcon />}
                </button>

                <button
                  className="dex-screener-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(coin.url || "#", "_blank");
                  }}
                >
                  <img
                    src={DexScreenerIcon}
                    alt="Dex Screener"
                    className="dex-screener-icon"
                  />
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
              </div>

              {/* Arka Yüz */}
              <div className="card-back">
                {/* Detaylar */}
                <div className="info-section">
                  {/* Tarihler */}
                  <div className="dates-row">
                    <div className="date-item">
                      <p className="info-label">Posted Date:</p>
                      <p className="info-value">
                        {new Date(coin.shareDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="date-item">
                      <p className="info-label">Current Date:</p>
                      <p className="info-value">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Fiyatlar */}
                  <div className="prices-row">
                    <div className="price-item">
                      <p className="info-label">Posted Price:</p>
                      <p className="info-value">
                        {coin.sharePrice
                          ? formatPriceWithConditionalZeros(coin.sharePrice)
                          : "Yükleniyor"}
                      </p>
                    </div>
                    <div className="price-item">
                      <p className="info-label">Current Price:</p>
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
                      <p className="info-label">Posted MarketCap:</p>
                      <p className="info-value">
                        {coin.shareMarketCap
                          ? formatMarketCap(coin.shareMarketCap)
                          : "Yükleniyor"}
                      </p>
                    </div>
                    <div className="marketcap-item">
                      <p className="info-label">Current&nbsp; Marketcap:</p>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onVisibilityChange={setIsPaginationVisible}
        />
      )}
    </div>
  );
};

export default UserPage;
