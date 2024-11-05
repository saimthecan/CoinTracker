import React, { useState } from "react";
import axios from "axios";
import { NumericFormat } from "react-number-format"; // NumericFormat'ı import ediyoruz
import "./AddCoinModal.css";

const AddCoinModal = ({ onClose, onAddCoin }) => {
  const [caAddress, setCaAddress] = useState("");
  const [shareDate, setShareDate] = useState("");
  const [shareMarketCap, setShareMarketCap] = useState("");
  const [sharePrice, setSharePrice] = useState("");
  const [inputType, setInputType] = useState("marketcap"); // Başlangıçta fiyat girişi
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

      // Eğer currentPrice ve currentMarketCap alınamadıysa hata ver
      if (!currentPrice || !currentMarketCap) {
        setError("Geçerli bir fiyat veya market cap bilgisi alınamadı.");
        return;
      }

      // Kullanıcı girdisine göre hesaplama yap
      let calculatedShareMarketCap = parseFloat(shareMarketCap);
      let calculatedSharePrice = parseFloat(sharePrice);

      if (inputType === "price") {
        // Fiyat girdiyse, market cap hesaplanacak
        calculatedShareMarketCap =
          (currentMarketCap / currentPrice) * calculatedSharePrice;
      } else {
        // Market cap girdiyse, fiyat hesaplanacak
        calculatedSharePrice =
          (currentPrice / currentMarketCap) * calculatedShareMarketCap;
      }

      // Hesaplanan değerlerin sayısal olup olmadığını kontrol et
      if (isNaN(calculatedShareMarketCap) || isNaN(calculatedSharePrice)) {
        setError(
          "Hesaplamada bir hata oluştu. Lütfen girişlerinizi kontrol edin."
        );
        return;
      }

      // Coin ekleme işlemi
      const newCoin = {
        caAddress: caAddress,
        shareDate: shareDate ? new Date(shareDate) : new Date(),
        shareMarketCap: calculatedShareMarketCap,
        sharePrice: calculatedSharePrice,
      };

      onAddCoin(newCoin); // Yeni coin ekleniyor
      onClose(); // Modalı kapat
    } catch (error) {
      console.error("Coin eklenirken hata oluştu:", error);
      setError("Coin eklenirken bir hata oluştu.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Add New Coin</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="caAddress">CA Address</label>
            <input
              type="text"
              id="caAddress"
              placeholder="CA Address"
              value={caAddress}
              onChange={(e) => setCaAddress(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="shareDate">Posting Date</label>
            <input
              type="date"
              id="shareDate"
              placeholder="Posting Date"
              value={shareDate}
              onChange={(e) => setShareDate(e.target.value)}
              required
            />
          </div>

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

          {inputType === "price" && (
            <div className="form-group">
              <input
                type="number"
                id="sharePrice"
                placeholder="Price on Date of Posted"
                value={sharePrice}
                onChange={(e) => setSharePrice(e.target.value)}
                required
                step="0.00000001"
              />
            </div>
          )}

          {inputType === "marketcap" && (
            <div className="form-group">
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
              Add
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

export default AddCoinModal;
