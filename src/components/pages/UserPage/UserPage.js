import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DexScreenerIcon from "../../../assets/dexscreener.png"; // SVG dosyasını içe aktarın
import AddCoinModal from "./AddCoinModal";
import twitterIcon from "../../../assets/twitter.svg";
import "./UserPage.css";

const UserPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCoinModal, setShowAddCoinModal] = useState(false); // Modal görünürlüğü için state

  // fetchUserData fonksiyonunu useCallback ile sarmalayarak memoize ediyoruz
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
            const currentMarketCap = pair.marketCap;
            const imageUrl = `https://dd.dexscreener.com/ds-data/tokens/${pair.chainId}/${coin.caAddress}.png?size=lg&key=a459db`;
            const url = pair.url || ""; // URL alanını ekleyin

            const marketCapComparison = calculateMarketCapChange(
              coin.shareMarketCap,
              currentMarketCap
            );

            return {
              ...coin,
              currentPrice,
              currentMarketCap,
              imageUrl,
              url, // URL'yi ekleyin
              marketCapComparison,
            };
          } catch (error) {
            console.error(`Coin verileri alınamadı (${coin.symbol}):`, error);
            return {
              ...coin,
              currentPrice: null,
              currentMarketCap: null,
              imageUrl: "",
              url: "",
              marketCapComparison: null,
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
    fetchUserData(); // Bileşen yüklendiğinde ilk veri çekme

    // 30 saniyede bir veri çekmek için setInterval ayarlama
    const intervalId = setInterval(() => {
      fetchUserData();
    }, 50000); // 30000 ms = 30 saniye

    // Temizleme fonksiyonu: Bileşen unmount olduğunda interval'i temizle
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
    // 1. Fiyatın geçerli olup olmadığını kontrol et (0 hariç)
    if (price === null || price === undefined || isNaN(price)) {
      return "Yükleniyor"; // Fiyat değeri yoksa
    }

    // 2. Fiyatın sıfır olup olmadığını kontrol et
    if (price === 0) {
      return <span>$0</span>;
    }

    // 3. Fiyatı stringe çevir ve bilimsel gösterimi düzelt
    let priceString = price.toString();

    if (priceString.includes("e")) {
      // Bilimsel gösterimi normal sayıya çevir
      priceString = price.toFixed(20).replace(/\.?0+$/, "");
    }

    // 4. Ondalık ve tam kısmı ayır
    let [integer, decimal] = priceString.split(".");

    if (!decimal) return <span>${integer}</span>;

    // 5. Ondalık kısmındaki sıfır sayısını hesapla
    let leadingZerosMatch = decimal.match(/^0+/);
    let zerosCount = leadingZerosMatch ? leadingZerosMatch[0].length : 0;

    if (zerosCount >= 4) {
      // 4 veya daha fazla sıfır varsa
      // 4 sıfırdan sonra gelen ilk 3 basamağı al
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
        // Integer kısmı 0 ise ve sıfır sayısı 4'ten azsa
        // 3 ondalık basamakla sınırlama
        let remainingDecimals = decimal.slice(zerosCount, zerosCount + 3);
        return (
          <span>
            ${integer}.{decimal.slice(0, zerosCount)}
            {remainingDecimals}
          </span>
        );
      } else {
        // Integer kısmı 0'dan büyükse, 2 ondalık basamakla sınırlama
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
      // 1. Yeni coini backend'e ekleyin
      const response = await axios.post(
        `https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users/${id}/coins`,
        newCoin
      );
      const addedCoin = response.data; // Backend'den eklenen coin

      // 2. DexScreener API'sinden ek verileri alın
      const dexResponse = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${addedCoin.caAddress}`
      );
      const pairs = dexResponse.data.pairs;
      if (!pairs || pairs.length === 0) {
        console.error("DexScreener API yanıtında coin bulunamadı.");
        // Ek veriler alınamadıysa, varsayılan değerler atayın
        addedCoin.currentPrice = null;
        addedCoin.currentMarketCap = null;
        addedCoin.imageUrl = "";
        addedCoin.url = "";
        addedCoin.marketCapComparison = null;
      } else {
        const pair = pairs[0];
        const currentPrice = parseFloat(pair.priceUsd);
        const currentMarketCap = parseFloat(pair.marketCap);

        if (isNaN(currentPrice) || isNaN(currentMarketCap)) {
          addedCoin.currentPrice = null;
          addedCoin.currentMarketCap = null;
        } else {
          addedCoin.currentPrice = currentPrice;
          addedCoin.currentMarketCap = currentMarketCap;
        }
        const imageUrl = `https://dd.dexscreener.com/ds-data/tokens/${pair.chainId}/${addedCoin.caAddress}.png?size=lg&key=a459db`;
        const url = pair.url || "";

        // Piyasa değeri değişimini hesaplayın
        const change =
          ((currentMarketCap - addedCoin.shareMarketCap) /
            addedCoin.shareMarketCap) *
          100;
        const marketCapComparison = change.toFixed(2);

        // Coin nesnesini zenginleştirin
        addedCoin.currentPrice = currentPrice;
        addedCoin.currentMarketCap = currentMarketCap;
        addedCoin.imageUrl = imageUrl;
        addedCoin.url = url;
        addedCoin.marketCapComparison = marketCapComparison;
      }

      console.log("Added Coin:", addedCoin);

      // 3. Zenginleştirilmiş coini frontend'deki coins durumuna ekleyin
      setCoins((prevCoins) => [...prevCoins, addedCoin]);

      // 4. Modal'ı kapatın
      setShowAddCoinModal(false);
    } catch (error) {
      console.error("Coin eklenirken hata oluştu:", error);
      alert("Coin eklenirken bir hata oluştu.");
    }
  };

  if (loading) {
    return <p>Yükleniyor...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="coin-container">
      {/* Başlık Bölümü */}
      <div className="header">
        <div className="user-info">
          <h1 className="user-name">{user.name}</h1>
          {/* Eğer alt başlık kullanmak isterseniz, aşağıdaki satırı aktif edebilirsiniz */}
          {/* <p className="user-experience">Kullanıcı Deneyimi</p> */}
        </div>
        <div className="add-coin-and-twitter">
          {" "}
          {/* Yeni Kapsayıcı */}
          <button
            className="add-coin-button"
            onClick={() => setShowAddCoinModal(true)}
          >
            Ekle
          </button>
          <a
            href={user.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="twitter-link"
          >
            <img src={twitterIcon} alt="Twitter" className="twitter-icons" />
          </a>
        </div>
      </div>

      {/* Add Coin Modal */}
      {showAddCoinModal && (
        <AddCoinModal
          onAddCoin={handleAddCoin} // Prop adını 'onAddCoin' olarak değiştirin
          onClose={() => setShowAddCoinModal(false)}
        />
      )}

      <div className="coin-grid">
        {coins.map((coin, index) => {
          console.log(`Coin ${index}:`, coin); // Tüm coin objesini logla
          console.log(`chainId: ${coin.chainId}, caAddress: ${coin.caAddress}`); // Özellikleri logla

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

                  {/* Dex Screener URL'si */}
                  <a
                    href={coin.url ? coin.url : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dex-screener-link"
                    onClick={(e) => {
                      e.stopPropagation(); // Olayın kartın onClick olayına yayılmasını durdurur
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
