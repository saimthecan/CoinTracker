// src/components/pages/UserPage/UserPage.js

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DexScreenerIcon from "../../../assets/dexscreener.png";
import defaultImage from "../../../assets/logo-free.png";
import AddCoinModal from "./AddCoinModal";
import "./UserPage.css";

const UserPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddCoinModal, setShowAddCoinModal] = useState(false);

  // Yeni state değişkenleri
  const [sortCriteria, setSortCriteria] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");


  // Twitter kullanıcı adını çıkaran fonksiyon
  const getTwitterUsername = (twitterUrl) => {
    if (!twitterUrl) return null;
    const match = twitterUrl.match(
      /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i
    );
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  // Kullanıcı verilerini çeken fonksiyon
  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users/${id}`
      );
      setUser(response.data);
      const coinsData = response.data.coins || [];

      const updatedCoins = await Promise.all(
        coinsData.map(async (coin) => {
          try {
            const response = await axios.get(
              `https://api.dexscreener.com/latest/dex/tokens/${coin.caAddress}`
            );
            const pairs = response.data.pairs;
            if (!pairs || pairs.length === 0) {
              throw new Error("Coin verileri alınamadı.");
            }

            const pair = pairs[0];
            const currentPrice = parseFloat(pair.priceUsd);
            const currentMarketCap = pair.marketCap;  // FDV yerine marketCap öncelikli
            const imageUrl = (pair.chainId && coin.caAddress && pair.priceUsd && pair.imageUrl !== "")
            ? `https://dd.dexscreener.com/ds-data/tokens/${pair.chainId}/${coin.caAddress}.png?size=lg&key=a459db`
            : defaultImage;
          
            const url = pair.url || "";

            const marketCapComparison = calculateMarketCapChange(
              coin.shareMarketCap,
              currentMarketCap
            );

            // Ağ bilgisini ekliyoruz
            const chainIdToNetwork = {
              ethereum: "Ethereum",
              bsc: "Binance Smart Chain",
              polygon: "Polygon",
              arbitrum: "Arbitrum",
              optimism: "Optimism",
              avalanche: "Avalanche",
              fantom: "Fantom",
              // Diğer ağları ekleyebilirsiniz
            };

            const network = chainIdToNetwork[pair.chainId] || pair.chainId;

            return {
              ...coin,
              currentPrice,
              currentMarketCap,
              imageUrl,
              url,
              marketCapComparison,
              network, // Ağ bilgisi
            };
          } catch (error) {
            console.error(`Coin verileri alınamadı (${coin.symbol}):`, error);
            return {
              ...coin,
              currentPrice: null,
              currentMarketCap: null,
              imageUrl: defaultImage,  // Hata durumunda yedek görsel kullan
              url: "",
              marketCapComparison: null,
              network: "Bilinmiyor",
            };
          }
        })
      );

      setCoins(updatedCoins);
      setLoading(false);
    } catch (error) {
      setError("Kullanıcı bulunamadı");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserData();

    const intervalId = setInterval(() => {
      fetchUserData();
    }, 50000);

    return () => clearInterval(intervalId);
  }, [fetchUserData]);

  const [flipped, setFlipped] = useState([]);

  useEffect(() => {
    setFlipped(new Array(coins.length).fill(false));
  }, [coins.length]);

  const handleFlip = (index) => {
    const newFlipped = [...flipped];
    newFlipped[index] = !newFlipped[index];
    setFlipped(newFlipped);
  };

  const formatMarketCap = (num) => {
    if (num === null || num === undefined) return "Yükleniyor";

    if (num >= 1.0e12) {
      return (num / 1.0e12).toFixed(2) + "T";
    }
    if (num >= 1.0e9) {
      return (num / 1.0e9).toFixed(2) + "B";
    }
    if (num >= 1.0e6) {
      return (num / 1.0e6).toFixed(2) + "M";
    }
    if (num >= 1.0e3) {
      return (num / 1.0e3).toFixed(2) + "K";
    }
    return num.toString();
  };

  const formatPriceWithConditionalZeros = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "Yükleniyor";
    }

    if (price === 0) {
      return <span>$0</span>;
    }

    let priceString = price.toString();

    if (priceString.includes("e")) {
      priceString = price.toFixed(20).replace(/\.?0+$/, "");
    }

    let [integer, decimal] = priceString.split(".");

    if (!decimal) return <span>${integer}</span>;

    let leadingZerosMatch = decimal.match(/^0+/);
    let zerosCount = leadingZerosMatch ? leadingZerosMatch[0].length : 0;

    if (zerosCount >= 4) {
      let remainingDecimals = decimal.slice(zerosCount, zerosCount + 3);

      return (
        <>
          <span>${integer}.0</span>
          <sub>{zerosCount}</sub>
          <span>{remainingDecimals}</span>
        </>
      );
    } else {
      if (integer === "0") {
        let remainingDecimals = decimal.slice(zerosCount, zerosCount + 3);
        return (
          <span>
            ${integer}.{decimal.slice(0, zerosCount)}
            {remainingDecimals}
          </span>
        );
      } else {
        let limitedDecimals = decimal.slice(0, 2);
        return (
          <span>
            ${integer}.{limitedDecimals}
          </span>
        );
      }
    }
  };

  const calculateMarketCapChange = (shareMarketCap, currentMarketCap) => {
    if (!shareMarketCap || !currentMarketCap) return "Yükleniyor";
    const change = ((currentMarketCap - shareMarketCap) / shareMarketCap) * 100;
    return change.toFixed(2);
  };

  const handleDeleteCoin = async (coinId) => {
    if (window.confirm("Bu coin'i silmek istediğinizden emin misiniz?")) {
      try {
        await axios.delete(
          `https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users/${id}/coins/${coinId}`
        );
        setCoins((prevCoins) =>
          prevCoins.filter((coin) => coin._id !== coinId)
        );
      } catch (error) {
        console.error("Coin silinirken hata oluştu:", error);
        alert("Coin silinirken bir hata oluştu.");
      }
    }
  };

  const handleAddCoin = async (newCoin) => {
    try {
      const response = await axios.post(
        `https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users/${id}/coins`,
        newCoin
      );
      const addedCoin = response.data;

      const dexResponse = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${addedCoin.caAddress}`
      );
      const pairs = dexResponse.data.pairs;
      if (!pairs || pairs.length === 0) {
        console.error("DexScreener API yanıtında coin bulunamadı.");
        addedCoin.currentPrice = null;
        addedCoin.currentMarketCap = null;
        addedCoin.imageUrl = "";
        addedCoin.url = "";
        addedCoin.marketCapComparison = null;
        addedCoin.network = "Bilinmiyor";
      } else {
        const pair = pairs[0];
        const currentPrice = parseFloat(pair.priceUsd);
        const currentMarketCap = parseFloat(pair.fdv || pair.marketCap);
        const imageUrl = `https://dd.dexscreener.com/ds-data/tokens/${pair.chainId}/${addedCoin.caAddress}.png?size=lg&key=a459db`;
        const url = pair.url || "";

        const change =
          ((currentMarketCap - addedCoin.shareMarketCap) /
            addedCoin.shareMarketCap) *
          100;
        const marketCapComparison = change.toFixed(2);

        const chainIdToNetwork = {
          ethereum: "Ethereum",
          bsc: "Binance Smart Chain",
          polygon: "Polygon",
          arbitrum: "Arbitrum",
          optimism: "Optimism",
          avalanche: "Avalanche",
          fantom: "Fantom",
        };

        const network = chainIdToNetwork[pair.chainId] || pair.chainId;

        addedCoin.currentPrice = currentPrice;
        addedCoin.currentMarketCap = currentMarketCap;
        addedCoin.imageUrl = imageUrl;
        addedCoin.url = url;
        addedCoin.marketCapComparison = marketCapComparison;
        addedCoin.network = network;
      }

      setCoins((prevCoins) => [...prevCoins, addedCoin]);
      setShowAddCoinModal(false);
    } catch (error) {
      console.error("Coin eklenirken hata oluştu:", error);
      alert("Coin eklenirken bir hata oluştu.");
    }
  };

  // Sıralama işlemi
  const sortedCoins = React.useMemo(() => {
    if (!sortCriteria) return coins;

    let sorted = [...coins];

    switch (sortCriteria) {
      case "shareDate":
        sorted.sort((a, b) => new Date(a.shareDate) - new Date(b.shareDate));
        break;
      case "profitPercentage":
        sorted.sort((a, b) => b.marketCapComparison - a.marketCapComparison);
        break;
      case "currentMarketCap":
        sorted.sort((a, b) => b.currentMarketCap - a.currentMarketCap);
        break;
      default:
        break;
    }

    return sorted;
  }, [coins, sortCriteria]);

  // Filtreleme işlemi
  const filteredCoins = React.useMemo(() => {
    if (!selectedNetwork) return sortedCoins;

    return sortedCoins.filter((coin) => coin.network === selectedNetwork);
  }, [sortedCoins, selectedNetwork]);

  if (loading) {
    return <p>Yükleniyor...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Twitter profil resmi URL'si
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
            <a
              href={user.twitter} // Kullanıcının Twitter sayfasına yönlendirme
              target="_blank" // Yeni sekmede açılmasını sağlamak için
              rel="noopener noreferrer" // Güvenlik için eklenen özellik
            >
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

          <label htmlFor="networkFilter">Ağa Göre Filtrele: </label>
          <select
            id="networkFilter"
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
          >
            <option value="">Tüm Ağlar</option>
            {Array.from(new Set(coins.map((coin) => coin.network))).map(
              (network) => (
                <option key={network} value={network}>
                  {network}
                </option>
              )
            )}
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

      <div className="coin-grid">
        {filteredCoins.map((coin, index) => {
          return (
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
              <div className="card-inner">
                {/* Ön yüz */}
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
  onError={(e) => e.target.src = defaultImage}
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
                  {/* Ağ Bilgisi */}
                  <div className="network-row network-bottom">
                    <div className="network-item">
                      <p className="info-value">({coin.network})</p>
                    </div>
                  </div>

                  {/* Dex Screener URL'si */}
                  <a
                    href={coin.url ? coin.url : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dex-screener-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!coin.url) {
                        e.preventDefault();
                        console.warn(
                          `Dex Screener linki oluşturulamadı: url eksik. Coin: ${coin.name}`
                        );
                        alert(`Dex Screener linki oluşturulamadı: URL eksik.`);
                      }
                    }}
                  >
                    <img
                      src={DexScreenerIcon}
                      alt="Dex Screener"
                      className="dex-screener-icon"
                    />
                  </a>
                </div>

                {/* Arka yüz */}
                <div className="card-back">
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
                          {formatPriceWithConditionalZeros(coin.sharePrice)}
                        </p>
                      </div>

                      <div className="price-item">
                        <p className="info-label">Güncel Fiyat:</p>
                        <p className="info-value">
                          {formatPriceWithConditionalZeros(coin.currentPrice)}
                        </p>
                      </div>
                    </div>

                    {/* Piyasa Değerleri */}
                    <div className="marketcap-row">
                      <div className="marketcap-item">
                        <p className="info-label">
                          <span className="desktop-label">
                            Paylaşım Piyasa Değeri:
                          </span>
                          <span className="mobile-label">
                            P. Piyasa Değeri:
                          </span>
                        </p>

                        <p className="info-value">
                          ${formatMarketCap(coin.shareMarketCap)}
                        </p>
                      </div>

                      <div className="marketcap-item">
                        <p className="info-label">
                          <span className="desktop-label">
                            Güncel Piyasa Değeri:
                          </span>
                          <span className="mobile-label">
                            G. Piyasa Değeri:
                          </span>
                        </p>

                        <p className="info-value">
                          ${formatMarketCap(coin.currentMarketCap)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserPage;
