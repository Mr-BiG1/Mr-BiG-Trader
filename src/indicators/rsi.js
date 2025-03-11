function calculateRSI(closes, period = 14) {
    if (closes.length < period + 1) return null;
  
    let gains = 0;
    let losses = 0;
  
    // Initial average gain/loss
    for (let i = 1; i <= period; i++) {
      const diff = closes[i - 1] - closes[i];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
  
    let avgGain = gains / period;
    let avgLoss = losses / period;
  
    // RSI for the next data point
    // prevent division by 0
    const rs = avgGain / (avgLoss || 1); 
    const rsi = 100 - 100 / (1 + rs);
  
    return rsi.toFixed(2);
  }
  
  module.exports = { calculateRSI };
  