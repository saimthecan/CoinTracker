import React, { useState, useEffect, useRef } from 'react';
import { faSpinner, faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import DexScreenerIcon from '../../../assets/dexscreener.png';
import StarIcon from '../../../StarIcons/StarIcon';
import EmptyStarIcon from '../../../StarIcons/EmptyStarIcon';
import defaultImage from '../../../assets/logo-free.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './FavoriCoinlerim.css';
import Pagination from '../../../Pagination/Pagination';

// Gerekli fonksiyonları import ediyoruz
import {
  formatPriceWithConditionalZeros,
  formatMarketCap,
  sortCoins,
  filterCoinsByNetwork,
} from "../UserPage/Utils";

const FavoriCoinlerim = () => {
  const [coins, setCoins] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [loading, setLoading] = useState(true);

  // Yeni eklenen state'ler
  const [sortCriteria, setSortCriteria] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [allNetworks, setAllNetworks] = useState([]);

  // Pagination için state
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 20; // Her sayfada gösterilecek coin sayısı

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchBarRef = useRef(null);
  const searchIconRef = useRef(null);

  const API_URL = 'https://cointracker-evt3.onrender.com';

  useEffect(() => {
    const fetchFavoriteCoins = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const response = await axios.get(`${API_URL}/appUser/${storedUser.userId}/coins/favorites`, {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        });

        const favoriteCoins = response.data;

        // Coin verilerini güncelle
        const updatedCoins = await Promise.all(
          favoriteCoins.map(async (coin) => {
            try {
              const dexResponse = await axios.get(
                `https://api.dexscreener.com/latest/dex/tokens/${coin.caAddress}`
              );
              const pairs = dexResponse.data.pairs;
              if (!pairs || pairs.length === 0) {
                throw new Error("Coin verileri alınamadı.");
              }
              const pair = pairs[0];
              const currentPrice = parseFloat(pair.priceUsd);
              const currentMarketCap = pair.marketCap;
              const imageUrl = `https://dd.dexscreener.com/ds-data/tokens/${pair.chainId}/${coin.caAddress}.png?size=lg&key=a459db`;
              const url = pair.url || "";

              const marketCapComparison = calculateMarketCapChange(
                coin.shareMarketCap,
                currentMarketCap
              );

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

              return {
                ...coin,
                currentPrice,
                currentMarketCap,
                imageUrl,
                url,
                marketCapComparison,
                network,
              };
            } catch (error) {
              console.error(`Coin verileri alınamadı (${coin.symbol}):`, error);
              return {
                ...coin,
                currentPrice: null,
                currentMarketCap: null,
                imageUrl: defaultImage,
                url: "",
                marketCapComparison: null,
                network: "Bilinmiyor",
              };
            }
          })
        );
      
        
        // Tüm ağları topluyoruz
        const networks = Array.from(new Set(updatedCoins.map((coin) => coin.network)));
        setAllNetworks(networks); // Ağları kaydediyoruz

        setCoins(updatedCoins);
        setFlipped(new Array(updatedCoins.length).fill(false));
        setLoading(false);
      } catch (error) {
        console.error('Favori coinler getirilirken hata oluştu:', error);
        setLoading(false);
      }
    };

    fetchFavoriteCoins();
  }, []);

  // Arama işlemi için fonksiyon
  const filterCoinsBySearchTerm = (coins, searchTerm) => {
    if (!searchTerm) return coins;
    return coins.filter((coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Sıralama ve filtreleme işlemlerini uyguluyoruz
  const sortedCoins = sortCoins(coins, sortCriteria, sortOrder);
  const filteredCoinsByNetwork = filterCoinsByNetwork(sortedCoins, selectedNetwork);
  const filteredCoins = filterCoinsBySearchTerm(filteredCoinsByNetwork, searchTerm);

  // Coins'in gösterileceği sayfalara göre bölünmesi
  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = filteredCoins.slice(indexOfFirstCoin, indexOfLastCoin);

  // Toplam sayfa sayısını hesapla
  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  // calculateMarketCapChange fonksiyonu
  const calculateMarketCapChange = (shareMarketCap, currentMarketCap) => {
    if (!shareMarketCap || !currentMarketCap) return "Loading";
    const change = ((currentMarketCap - shareMarketCap) / shareMarketCap) * 100;
    return change.toFixed(2);
  };

  // Kartı çevirme fonksiyonu
  const handleFlip = (index) => {
    setFlipped((prev) => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const handleSearchIconClick = () => {
    setSearchOpen(!searchOpen);
  };
  

  // Favori durumunu değiştirme fonksiyonu
  const handleToggleFavoriteCoin = async (coinId, influencerId, isCurrentlyFavorite) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (isCurrentlyFavorite) {
        // Coin'i favoriden çıkar
        await axios.delete(`${API_URL}/appUser/${storedUser.userId}/influencer/${influencerId}/coins/${coinId}/favorite`, {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        });
  
        // Coin'i listeden kaldır
        setCoins((prevCoins) =>
          prevCoins.filter((coin) => coin._id !== coinId)
        );
      } else {
        // Coin'i favorilere ekle
        await axios.put(`${API_URL}/appUser/${storedUser.userId}/influencer/${influencerId}/coins/${coinId}/favorite`, {}, {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        });
  
        // Coin'in favori durumunu güncelle
        setCoins((prevCoins) =>
          prevCoins.map((coin) =>
            coin._id === coinId ? { ...coin, isFavorite: true } : coin
          )
        );
      }
    } catch (error) {
      console.error('Favori durum değiştirilirken hata oluştu:', error);
      alert('Favori durum değiştirilirken bir hata oluştu.');
    }
  };
  
  

  // Arama çubuğunu dışına tıklanınca kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchOpen &&
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target) &&
        searchIconRef.current &&
        !searchIconRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  if (loading) {
    return (
      <div className="loading-icon">
        <FontAwesomeIcon icon={faSpinner} spin /> {/* Loading icon */}
      </div>
    );
  }

  

  return (
    <div className="coin-container">
   <header className="favorites-header">
  <div className="title-and-icon">
    <h1>Star Coins</h1>
    <div
      className="search-icon-container"
      onClick={handleSearchIconClick}
      ref={searchIconRef}
    >
      <FontAwesomeIcon icon={faSearch} className="search-icon" />
    </div>
  </div>

  {/* Arama Çubuğu */}
  {searchOpen && (
    <div className="search-bar-container" ref={searchBarRef}>
      <input
        type="text"
        placeholder="Search Coin"
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )}
</header>

      <div className="controls">
  <div className="filter-section">
    <label htmlFor="sortCriteria">Sort: </label>

    <span
      className={`sort-icon-container ${sortCriteria === "" ? "hide-mobile" : ""}`}
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


      <div className="coin-grid">
      {currentCoins.map((coin, index) => (
        
          <div
            key={coin._id}
            className={`card ${flipped[index] ? 'flipped' : ''}`}
            onClick={() => handleFlip(index)}
          >
            <div className="card-inner">
              {/* Kartın Ön Yüzü */}
              <div className="card-front">
                {/* DexScreener İkonu - Sağ Alt */}
                <a
                  href={coin.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dex-screener-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={DexScreenerIcon}
                    alt="Dex Screener"
                    className="dex-screener-icon"
                  />
                </a>

                {/* Favori Butonu - Sağ Üst */}
                <button
                  className="favorite-button"
                  onClick={(e) => {
                    e.stopPropagation();
                     handleToggleFavoriteCoin(coin._id, coin.influencerId, coin.isFavorite);
                  }}
                >
                  {coin.isFavorite ? <StarIcon /> : <EmptyStarIcon />}
                </button>

                {/* Coin Resmi */}
                <img
                  src={coin.imageUrl || defaultImage}
                  alt={coin.name}
                  className="coin-image"
                  onError={(e) => (e.target.src = defaultImage)}
                />

                {/* Coin Adı ve Sembolü */}
                <h3>
                  {coin.name} ({coin.symbol})
                </h3>

                {/* Kar/Zarar Durumu */}
                <p
                  className={`market-cap-comparison ${
                    coin.marketCapComparison >= 0 ? 'positive' : 'negative'
                  }`}
                >
                  {coin.marketCapComparison}%
                </p>

                {/* Kullanıcı Adı ve Ağ İsmi */}
                <div className="network-row network-bottom">
                  <div className="network-item">
                    <p className="info-value">
                      ({coin.influencerName}) ({coin.network})
                    </p>
                  </div>
                </div>
              </div>

              {/* Kartın Arka Yüzü */}
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
                          : "Loading"}
                      </p>
                    </div>
                    <div className="price-item">
                      <p className="info-label">Current Price:</p>
                      <p className="info-value">
                        {coin.currentPrice
                          ? formatPriceWithConditionalZeros(coin.currentPrice)
                          : "Loading"}
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
                          : "Loading"}
                      </p>
                    </div>
                    <div className="marketcap-item">
                      <p className="info-label">Current MarketCap:</p>
                      <p className="info-value">
                        {coin.currentMarketCap
                          ? formatMarketCap(coin.currentMarketCap)
                          : "Loading"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={handlePageChange}
    
  />
)}

    </div>
  );
};

export default FavoriCoinlerim;
