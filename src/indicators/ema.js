// const { EMA } = require('technicalindicators');

// function calculateEMA(closes, period) {
//   return EMA.calculate({ period, values: closes });
// }

// function getTrendSignal(closes) {
//   const ema50 = calculateEMA(closes, 50);
//   const ema200 = calculateEMA(closes, 200);

//   const latestEMA50 = ema50[ema50.length - 1];
//   const latestEMA200 = ema200[ema200.length - 1];

//   if (!latestEMA50 || !latestEMA200) return 'neutral';

//   if (latestEMA50 > latestEMA200) return 'uptrend';
//   if (latestEMA50 < latestEMA200) return 'downtrend';
//   return 'neutral';
// }

// module.exports = {
//   calculateEMA,
//   getTrendSignal
// };

const { EMA } = require('technicalindicators');

function calculateEMA(closes, period, minDataLength = 50) {
  if (closes.length < minDataLength) return [];
  try {
    return EMA.calculate({ period, values: closes });
  } catch (error) {
    console.error(`EMA Calculation Error (period ${period}):`, error.message);
    return [];
  }
}

function getTrendSignal(closes) {
  const requiredLength = Math.max(50, 200); // Ensure enough data for both EMAs
  if (closes.length < requiredLength) {
    console.warn(`Insufficient data for trend analysis (${closes.length} < ${requiredLength})`);
    return 'neutral';
  }

  const ema50 = calculateEMA(closes, 50, 50);
  const ema200 = calculateEMA(closes, 200, 200);

  if (ema50.length < 1 || ema200.length < 1) return 'neutral';

  // Use the last calculated EMA values
  const latestEMA50 = ema50[ema50.length - 1];
  const latestEMA200 = ema200[ema200.length - 1];

  // Add threshold to avoid false crossovers
  const crossoverThreshold = latestEMA200 * 0.005; // 0.5% threshold
  
  if (latestEMA50 > latestEMA200 + crossoverThreshold) return 'bullish';
  if (latestEMA50 < latestEMA200 - crossoverThreshold) return 'bearish';
  return 'neutral';
}

module.exports = {
  calculateEMA,
  getTrendSignal
};