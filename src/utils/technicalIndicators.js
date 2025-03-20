// src/utils/technicalIndicators.js

function calculateATR(data, period = 14) {
    if (data.length < period + 1) return null;
  
    const trueRanges = [];
  
    for (let i = 1; i <= period; i++) {
      const current = data[i];
      const previous = data[i - 1];
  
      const highLow = current.high - current.low;
      const highClose = Math.abs(current.high - previous.close);
      const lowClose = Math.abs(current.low - previous.close);
  
      const tr = Math.max(highLow, highClose, lowClose);
      trueRanges.push(tr);
    }
  
    const atr = trueRanges.reduce((sum, val) => sum + val, 0) / period;
    return parseFloat(atr.toFixed(2));
  }
  
  function calculateVolatilityStop(data, atrMultiplier = 2) {
    const atr = calculateATR(data);
    if (!atr) return { longStop: null, shortStop: null };
  
    const currentPrice = data[0].close;
    return {
      longStop: parseFloat((currentPrice - atrMultiplier * atr).toFixed(2)),
      shortStop: parseFloat((currentPrice + atrMultiplier * atr).toFixed(2))
    };
  }
  
  module.exports = {
    calculateATR,
    calculateVolatilityStop
  };
  