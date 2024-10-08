// src/components/CryptoTicker/CryptoTicker.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CryptoTicker.css';

const coinIds = [
  'bitcoin',
  'ethereum',
  'binancecoin',
  'solana',
  'dogecoin',
  'tron',
  'the-open-network',
  'avalanche-2',
  'sui',
];

const coinLogos = {
  bitcoin: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  ethereum: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  binancecoin: 'https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png',
  solana: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  dogecoin: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
  tron: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
  "the-open-network": 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png',
  'avalanche-2': 'https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png',
  sui: 'https://assets.coingecko.com/coins/images/26375/standard/sui-ocean-square.png?1727791290',
};

const CryptoTicker = () => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price`,
          {
            params: {
              ids: coinIds.join(','),
              vs_currencies: 'usd',
              include_24hr_change: 'true',
            },
          }
        );

        const coinData = coinIds.map((id) => ({
          id,
          symbol: id === 'avalanche-2' ? 'AVAX' : id.toUpperCase(),
          price: response.data[id]?.usd ?? 'N/A',
          change: response.data[id]?.usd_24h_change ?? 0,
          logo: coinLogos[id],
        }));

        setCoins(coinData);
      } catch (error) {
        console.error('Coin fiyatları alınırken hata oluştu:', error);
      }
    };

    fetchPrices();

    // Fiyatları her 1 dakikada bir güncelle
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="crypto-ticker">
      <div className="ticker-content">
        {coins.map((coin) => (
          <div key={coin.id} className="ticker-item">
            <img src={coin.logo} alt={coin.symbol} className="coin-logo" />
            <span className="coin-name">{coin.symbol}</span>
            <span className="coin-price">${coin.price.toLocaleString()}</span>
            <span
              className={`coin-change ${
                coin.change >= 0 ? 'positive' : 'negative'
              }`}
            >
              {coin.change >= 0 ? '▲' : '▼'} {coin.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoTicker;
