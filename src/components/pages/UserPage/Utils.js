// src/utils/utils.js

// Fiyatları formatlayan fonksiyon
export const formatPriceWithConditionalZeros = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "Yükleniyor";
    }
  
    if (price === 0) {
      return <span>$0</span>;
    }
  
    let priceString = price.toString();
  
    // Eğer bilimsel notasyon varsa daha büyük hassasiyetle gösterelim
    if (priceString.includes("e")) {
      priceString = price.toFixed(20).replace(/\.?0+$/, "");
    }
  
    let [integer, decimal] = priceString.split(".");
  
    // Ondalık kısmı olmayan sayılar için
    if (!decimal) return <span>${integer}</span>;
  
    let leadingZerosMatch = decimal.match(/^0+/);
    let zerosCount = leadingZerosMatch ? leadingZerosMatch[0].length : 0;
  
    // Ondalık sayılarda 4 veya daha fazla sıfır varsa formatlayalım
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
  
// Piyasa değerini formatlayan fonksiyon
export const formatMarketCap = (num) => {
    if (num === null || num === undefined) return "Yükleniyor";
  
    if (num >= 1.0e12) {
      return "$" + (num / 1.0e12).toFixed(2) + "T"; // Trilyon
    }
    if (num >= 1.0e9) {
      return "$" + (num / 1.0e9).toFixed(2) + "B"; // Milyar
    }
    if (num >= 1.0e6) {
      return "$" + (num / 1.0e6).toFixed(2) + "M"; // Milyon
    }
    if (num >= 1.0e3) {
      return "$" + (num / 1.0e3).toFixed(2) + "K"; // Bin
    }
    return "$" + num.toString(); // Diğer durumlar
  };
  
  

  export const sortCoins = (coins, sortCriteria, sortOrder) => {
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
  
    // Eğer sortOrder "desc" ise ters çevir
    if (sortOrder === "desc") {
      sorted.reverse();
    }
  
    return sorted;
  };
  
  
  // Filtreleme işlemi
  export const filterCoinsByNetwork = (coins, selectedNetwork) => {
    if (!selectedNetwork) return coins;
  
    return coins.filter((coin) => coin.network === selectedNetwork);
  };