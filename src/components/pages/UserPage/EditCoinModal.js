// src/components/pages/UserPage/EditCoinModal.js

import React, { useState } from "react";
import axios from "axios";
import { NumericFormat } from "react-number-format";
import "./EditCoinModal.css";

const EditCoinModal = ({ coin, onClose, onUpdateCoin }) => {
  const [caAddress] = useState(coin.caAddress); // CA Adresi değiştirilemez
  const [shareDate, setShareDate] = useState(
    coin.shareDate ? coin.shareDate.slice(0, 10) : ""
  );
  const [shareMarketCap, setShareMarketCap] = useState(coin.shareMarketCap || "");
  const [sharePrice, setSharePrice] = useState(coin.sharePrice || "");
  const [inputType, setInputType] = useState("marketcap");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Coin bilgilerini DexScreener API'den alıyoruz
      const dexResponse = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${caAddress}`
      );
      const pairs = dexResponse.data.pairs;

      if (!pairs || pairs.length === 0) {
        setError("Coin bilgileri alınamadı, lütfen doğru CA adresi girin.");
        return;
      }

      const pair = pairs[0];
      const currentPrice = parseFloat(pair.priceUsd);
      const currentMarketCap = parseFloat(pair.marketCap);

      if (!currentPrice || !currentMarketCap) {
        setError("Geçerli bir fiyat veya market cap bilgisi alınamadı.");
        return;
      }

      let calculatedShareMarketCap = parseFloat(shareMarketCap);
      let calculatedSharePrice = parseFloat(sharePrice);

      if (inputType === "price") {
        calculatedShareMarketCap = (currentMarketCap / currentPrice) * calculatedSharePrice;
      } else {
        calculatedSharePrice = (currentPrice / currentMarketCap) * calculatedShareMarketCap;
      }

      if (isNaN(calculatedShareMarketCap) || isNaN(calculatedSharePrice)) {
        setError("Hesaplamada bir hata oluştu. Lütfen girişlerinizi kontrol edin.");
        return;
      }

      const updatedCoin = {
        ...coin,
        shareDate: shareDate ? new Date(shareDate) : new Date(),
        shareMarketCap: calculatedShareMarketCap,
        sharePrice: calculatedSharePrice,
      };

      await onUpdateCoin(updatedCoin);
      onClose();
    } catch (error) {
      console.error("Coin güncellenirken hata oluştu:", error);
      setError("Coin güncellenirken bir hata oluştu.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Edit Coin Information</h2>
        <form onSubmit={handleSubmit}>
          {/* CA Adresi (Değiştirilemez) */}
          <div className="form-group">
            <label htmlFor="caAddress">CA Address</label>
            <input type="text" id="caAddress" value={caAddress} disabled />
          </div>
          {/* Paylaşım Tarihi */}
          <div className="form-group">
            <label htmlFor="shareDate">Posted Date</label>
            <input
              type="date"
              id="shareDate"
              placeholder="Paylaşım Tarihi"
              value={shareDate}
              onChange={(e) => setShareDate(e.target.value)}
              required
            />
          </div>

          {/* Giriş Tipi Seçimi */}
          <div className="form-group radio-group">
            <div className="radio-container">
              <input
                type="radio"
                id="marketcap"
                name="inputType"
                value="marketcap"
                checked={inputType === "marketcap"}
                onChange={() => setInputType("marketcap")}
              />
              <label htmlFor="marketcap" className="radio-label">
                Market Cap
              </label>

              <input
                type="radio"
                id="price"
                name="inputType"
                value="price"
                checked={inputType === "price"}
                onChange={() => setInputType("price")}
              />
              <label htmlFor="price" className="radio-label">
               Price
              </label>
            </div>
          </div>

          {/* Fiyat veya Market Cap Girişi */}
          {inputType === "price" && (
            <div className="form-group">
              <label htmlFor="sharePrice">Posted Price</label>
              <input
                type="number"
                id="sharePrice"
                placeholder="Posted Price"
                value={sharePrice}
                onChange={(e) => setSharePrice(e.target.value)}
                required
                step="0.00000001"
              />
            </div>
          )}

          {inputType === "marketcap" && (
            <div className="form-group">
              <label htmlFor="shareMarketCap">Posted Market Cap</label>
              <NumericFormat
                thousandSeparator=","
                allowNegative={false}
                id="shareMarketCap"
                placeholder="Posted Market Cap"
                value={shareMarketCap}
                onValueChange={(values) => {
                  const { value } = values; // formatlanmamış değer
                  setShareMarketCap(value);
                }}
                required
                className="formatted-input"
              />
            </div>
          )}

          {error && <p className="error-message">{error}</p>}

          <div className="button-group">
            <button type="submit" className="submit-button">
              Update
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
             Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCoinModal;
