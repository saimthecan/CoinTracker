// src/hooks/useUserPage.js

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import defaultImage from "../../../assets/logo-free.png";
import { sortCoins, filterCoinsByNetwork } from "./Utils";

const API_URL = "https://calm-harbor-22861-fa5a63bab33f.herokuapp.com";

export const useUserPage = (id) => {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flipped, setFlipped] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [allNetworks, setAllNetworks] = useState([]);

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

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/users/${id}`);
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

  const handleFlip = (index) => {
    const newFlipped = [...flipped];
    newFlipped[index] = !newFlipped[index];
    setFlipped(newFlipped);
  };

  const handleDeleteCoin = async (coinId) => {
    if (window.confirm("Bu coin'i silmek istediğinizden emin misiniz?")) {
      try {
        await axios.delete(`${API_URL}/users/${id}/coins/${coinId}`);
        setCoins((prevCoins) => prevCoins.filter((coin) => coin._id !== coinId));
      } catch (error) {
        console.error("Coin silinirken hata oluştu:", error);
        alert("Coin silinirken bir hata oluştu.");
      }
    }
  };

  const handleAddCoin = async (newCoin) => {
    try {
      const response = await axios.post(`${API_URL}/users/${id}/coins`, newCoin);
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
        addedCoin.currentPrice = parseFloat(pair.priceUsd);
        addedCoin.currentMarketCap = pair.marketCap;
        addedCoin.imageUrl = `https://dd.dexscreener.com/ds-data/tokens/${pair.chainId}/${addedCoin.caAddress}.png?size=lg&key=a459db`;
        addedCoin.url = pair.url || "";
        addedCoin.marketCapComparison = (
          ((pair.marketCap - addedCoin.shareMarketCap) / addedCoin.shareMarketCap) *
          100
        ).toFixed(2);
        const chainIdToNetwork = {
          ethereum: "Ethereum",
          bsc: "Binance Smart Chain",
          polygon: "Polygon",
          arbitrum: "Arbitrum",
          optimism: "Optimism",
          avalanche: "Avalanche",
          fantom: "Fantom",
        };
        addedCoin.network = chainIdToNetwork[pair.chainId] || pair.chainId;
      }

      setCoins((prevCoins) => [...prevCoins, addedCoin]);
    } catch (error) {
      console.error("Coin eklenirken hata oluştu:", error);
      alert("Coin eklenirken bir hata oluştu.");
    }
  };

  const calculateMarketCapChange = (shareMarketCap, currentMarketCap) => {
    if (!shareMarketCap || !currentMarketCap) return "Yükleniyor";
    const change = ((currentMarketCap - shareMarketCap) / shareMarketCap) * 100;
    return change.toFixed(2);
  };

  // Sıralama ve filtreleme işlemlerini uyguluyoruz
  const sortedCoins = sortCoins(coins, sortCriteria);
  const filteredCoins = filterCoinsByNetwork(sortedCoins, selectedNetwork);

  return {
    user,
    coins: filteredCoins, // Filtrelenmiş ve sıralanmış coinleri döndürüyoruz
    loading,
    error,
    flipped,
    handleFlip,
    handleDeleteCoin,
    handleAddCoin,
    sortCriteria,
    setSortCriteria,
    selectedNetwork,
    setSelectedNetwork,
    defaultImage,
    getTwitterUsername,
    allNetworks,
  };
};