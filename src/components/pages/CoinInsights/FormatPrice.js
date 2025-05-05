export const formatPriceWithConditionalZeros = (rawPrice) => {
    const price = Number(rawPrice);
    if (Number.isNaN(price)) return "N/A";
  
    if (price === 0) return "$0";
  
    let priceString = price.toString();
  
    if (priceString.includes("e")) {
      priceString = price.toFixed(20).replace(/\.?0+$/, "");
    }
  
    let [integer, decimal] = priceString.split(".");
  
    if (!decimal) return `$${integer}`;
  
    const leadingZeros = decimal.match(/^0+/)?.[0]?.length || 0;
  
    if (leadingZeros >= 4) {
      const remaining = decimal.slice(leadingZeros, leadingZeros + 3);
      return `$${integer}.0${"₀".repeat(leadingZeros)}${remaining}`;
    }
  
    return `$${price.toFixed(4)}`;
  };
  