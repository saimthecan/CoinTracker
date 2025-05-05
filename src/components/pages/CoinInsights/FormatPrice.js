/* =========================================
   Fiyat formatlama fonksiyonu (JSX döndürüyor)
   ========================================= */
   export const formatPriceWithConditionalZeros = (rawPrice) => {
    if (rawPrice === null || rawPrice === undefined) {
      return "Loading";
    }
    const price = Number(rawPrice);
    if (Number.isNaN(price)) {
      return "Loading";
    }
    if (price === 0) {
      return <span>$0</span>;
    }
  
    let priceString = price.toString();
  
    // Bilimsel notasyon varsa
    if (priceString.includes("e")) {
      priceString = price.toFixed(20).replace(/\.?0+$/, "");
    }
  
    let [integer, decimal] = priceString.split(".");
  
    // Ondalık kısım yoksa doğrudan döndür
    if (!decimal) {
      return <span>${integer}</span>;
    }
  
    // Ondalık kısımda kaç sıfır var?
    const leadingZerosMatch = decimal.match(/^0+/);
    const zerosCount = leadingZerosMatch ? leadingZerosMatch[0].length : 0;
  
    // 4 veya daha fazla sıfır varsa
    if (zerosCount >= 4) {
      const remainingDecimals = decimal.slice(zerosCount, zerosCount + 3);
      return (
        <span>
          ${integer}.0<sub>{zerosCount}</sub>
          {remainingDecimals}
        </span>
      );
    } else {
      // integer 0 ise (örneğin 0.0012)
      if (integer === "0") {
        // 3 basamak gösterelim
        const decimalsToShow = decimal.slice(0, zerosCount + 3);
        return (
          <span>
            ${integer}.{decimalsToShow}
          </span>
        );
      } else {
        // integer > 0 ise 2 basamak
        const limitedDecimals = decimal.slice(0, 2);
        return (
          <span>
            ${integer}.{limitedDecimals}
          </span>
        );
      }
    }
  };