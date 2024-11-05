// src/hooks/useAdminUserPage.js

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import defaultImage from "../../../assets/logo-free.png";
import { sortCoins, filterCoinsByNetwork } from "./Utils";
import { useSelector } from 'react-redux';
import {jwtDecode} from 'jwt-decode';

const API_URL = "https://cointracker-backend-7786c0daa55a.herokuapp.com";

export const useAdminUserPage = (id) => {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flipped, setFlipped] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [allNetworks, setAllNetworks] = useState([]);

  const { token } = useSelector((state) => state.user);

  // Axios isteklerine token eklemek için interceptor
  axios.interceptors.request.use(
    (config) => {
      const storedUserData = localStorage.getItem('user');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        config.headers['Authorization'] = `Bearer ${userData.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Token geçerliliğini kontrol eden fonksiyon
  const checkTokenValidity = () => {
    const storedUserData = localStorage.getItem('user');
    if (!storedUserData) {
      return false;
    }

    const userData = JSON.parse(storedUserData);
    const decodedToken = jwtDecode(userData.token);
    const currentTime = Date.now() / 1000;

    // Token süresi dolmuşsa false döner
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('user');
      return false;
    }

    return true;
  };

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

  const fetchAdminInfluencerData = useCallback(async () => {
    try {
      // Token geçerliliği kontrolü
      if (!checkTokenValidity()) {
        throw new Error("Token geçersiz veya bulunamadı.");
      }

      const storedUserData = JSON.parse(localStorage.getItem('user'));
      const userToken = storedUserData?.token;

      if (!userToken) {
        throw new Error("Token bulunamadı");
      }

      // Influencer bilgisini ve coinlerini alıyoruz
      const response = await axios.get(
        `${API_URL}/appUser/admin-influencers/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      const influencer = response.data;
      setUser(influencer);

      // Coinler influencer nesnesinin içinde
      const influencerCoins = influencer.coins;

      const updatedCoins = await Promise.all(
        influencerCoins.map(async (coin) => {
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
            const imageUrl =
              pair.chainId && coin.caAddress && pair.priceUsd && pair.imageUrl !== ""
                ? `https://dd.dexscreener.com/ds-data/tokens/${pair.chainId}/${coin.caAddress}.png?size=lg&key=a459db`
                : defaultImage;

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
              influencerId: id,
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
      const networks = Array.from(
        new Set(updatedCoins.map((coin) => coin.network))
      );
      setAllNetworks(networks); // Ağları kaydediyoruz

      setCoins(updatedCoins);
      setLoading(false);
    } catch (error) {
      console.error('Admin influencer verileri alınırken hata oluştu:', error);
      setError("Influencer bulunamadı");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAdminInfluencerData();

    const intervalId = setInterval(() => {
      fetchAdminInfluencerData();
    }, 50000);

    return () => clearInterval(intervalId);
  }, [fetchAdminInfluencerData]);

  const handleFlip = (index) => {
    const newFlipped = [...flipped];
    newFlipped[index] = !newFlipped[index];
    setFlipped(newFlipped);
  };

  const handleDeleteCoin = async (coinId) => {
    if (window.confirm("Bu coin'i silmek istediğinizden emin misiniz?")) {
      try {
        await axios.delete(
          `${API_URL}/appUser/admin-influencers/${id}/coins/${coinId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        // Verileri yenilemek için tekrar çekiyoruz
        await fetchAdminInfluencerData();
      } catch (error) {
        console.error("Coin silinirken hata oluştu:", error);
        alert("Coin silinirken bir hata oluştu.");
      }
    }
  };

  const handleAddCoin = async (newCoin) => {
    try {
      await axios.post(
        `${API_URL}/appUser/admin-influencers/${id}/coins`,
        newCoin,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      // Yeni coin eklendikten sonra verileri tekrar çekiyoruz
      await fetchAdminInfluencerData();
      // Artık setCoins ile coinleri güncellememize gerek yok
    } catch (error) {
      console.error("Coin eklenirken hata oluştu:", error);
      alert("Coin eklenirken bir hata oluştu.");
    }
  };
  

  const handleUpdateCoin = async (updatedCoin) => {
    try {
      await axios.put(
        `${API_URL}/appUser/admin-influencers/${id}/coins/${updatedCoin._id}`,
        updatedCoin,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      // Verileri yenilemek için tekrar çekiyoruz
      await fetchAdminInfluencerData();
    } catch (error) {
      console.error("Coin güncellenirken hata oluştu:", error);
      alert("Coin güncellenirken bir hata oluştu.");
    }
  };

  const handleToggleFavoriteCoin = async (coinId, influencerId, isCurrentlyFavorite) => {
    try {
      const endpoint = `${API_URL}/appUser/admin-influencers/${influencerId}/coins/${coinId}/favorite`;
      
      if (isCurrentlyFavorite) {
        await axios.delete(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        await axios.put(endpoint, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      setCoins((prevCoins) =>
        prevCoins.map((coin) =>
          coin._id === coinId ? { ...coin, isFavorite: !isCurrentlyFavorite } : coin
        )
      );
    } catch (error) {
      console.error('Favori durum değiştirilirken hata oluştu:', error);
      alert('Favori durum değiştirilirken bir hata oluştu.');
    }
   };
   

  const calculateMarketCapChange = (shareMarketCap, currentMarketCap) => {
    if (!shareMarketCap || !currentMarketCap) return "Loading";
    const change = ((currentMarketCap - shareMarketCap) / shareMarketCap) * 100;
    return change.toFixed(2);
  };

  // Sıralama ve filtreleme işlemlerini uyguluyoruz
  const sortedCoins = sortCoins(coins, sortCriteria, sortOrder);
  const filteredCoins = filterCoinsByNetwork(sortedCoins, selectedNetwork);

  return {
    user,
    coins: filteredCoins,
    loading,
    error,
    flipped,
    handleFlip,
    handleDeleteCoin,
    handleAddCoin,
    handleUpdateCoin,
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
  };
};