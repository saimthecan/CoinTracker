import React, { useState } from "react";


const AddCoinModal = ({ onClose, onAddCoin }) => {
  const [caAddress, setCaAddress] = useState("");
  const [shareDate, setShareDate] = useState("");
  const [shareMarketCap, setShareMarketCap] = useState("");
  const [sharePrice, setSharePrice] = useState("");
  const [error, setError] = useState("");

 

  const handleSubmit = async (e) => {
    e.preventDefault();

   
  

    try {
      const newCoin = {
        caAddress: caAddress,
        shareDate: shareDate ? new Date(shareDate) : new Date(),
        shareMarketCap: parseFloat(shareMarketCap),
        sharePrice: parseFloat(sharePrice),
      };

      console.log("Yeni coin nesnesi:", newCoin);

      onAddCoin(newCoin); // Yeni coin ekleniyor
    } catch (error) {
      console.error("Coin eklenirken hata oluştu:", error);
      alert("Coin eklenirken bir hata oluştu.");
    }
  };

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <h3>Yeni Coin Ekle</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="CA Adresi"
            value={caAddress}
            onChange={(e) => setCaAddress(e.target.value)}
            required
            style={inputStyle}
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input
            type="date"
            placeholder="Paylaşım Tarihi"
            value={shareDate}
            onChange={(e) => setShareDate(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Paylaşım Tarihindeki Market Cap"
            value={shareMarketCap}
            onChange={(e) => setShareMarketCap(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Paylaşım Tarihindeki Fiyat"
            value={sharePrice}
            onChange={(e) => setSharePrice(e.target.value)}
            required
            step="0.00000001"
            style={inputStyle}
          />
          <div style={{ marginTop: "10px" }}>
            <button type="submit" style={buttonStyle}>
              Ekle
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, marginLeft: "10px" }}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal stilleri
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "350px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
};

// Input ve buton stilleri
const inputStyle = {
  width: "100%",
  padding: "8px",
  margin: "5px 0",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const buttonStyle = {
  padding: "8px 12px",
  cursor: "pointer",
  backgroundColor: "#007BFF",
  color: "white",
  border: "none",
  borderRadius: "4px",
  transition: "background-color 0.3s",
};

export default AddCoinModal;
