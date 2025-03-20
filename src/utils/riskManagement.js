// src/utils/riskManagement.js
const { calculateATR } = require('./technicalIndicators');
const { getAccountBalance, getOpenPositions } = require('./brokerAPI');

// Risk Configuration
const RISK_PER_TRADE = 0.01; // 1% of account per trade
const MAX_DAILY_LOSS = 0.05; // 5% daily loss limit
const MIN_RISK_REWARD = 2;   // Minimum 2:1 reward to risk

let dailyDrawdown = 0;

// ✅ Get total portfolio value
async function getPortfolioValue() {
  try {
    const balance = await getAccountBalance();
    const positions = await getOpenPositions();

    const positionValue = positions.reduce((sum, p) => {
      return sum + (p.marketValue || p.quantity * p.currentPrice);
    }, 0);

    return balance.cash + positionValue;
  } catch (err) {
    console.error('⚠️ Failed to fetch portfolio value:', err);
    return 10000; // Fallback default
  }
}

// ✅ Calculate how many shares to buy
function calculatePositionSize(entryPrice, stopLossPrice, portfolioValue) {
  const riskAmount = portfolioValue * RISK_PER_TRADE;
  const priceRisk = Math.abs(entryPrice - stopLossPrice);
  if (priceRisk <= 0) throw new Error('Invalid stop loss');
  const shares = Math.floor(riskAmount / priceRisk);
  return Math.max(shares, 1);
}

// ✅ Volatility-based dynamic stop
function calculateVolatilityStop(historicalData, atrPeriod = 14, multiplier = 2) {
  const atr = calculateATR(historicalData, atrPeriod);
  const close = historicalData[historicalData.length - 1].close;
  return {
    longStop: +(close - atr * multiplier).toFixed(2),
    shortStop: +(close + atr * multiplier).toFixed(2)
  };
}

// ✅ Risk/reward validation
function validateRiskReward(entry, stop, target) {
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  return (risk > 0) && (reward / risk >= MIN_RISK_REWARD);
}

// ✅ Max exposure per trade
async function calculateMaxPositionValue() {
  const value = await getPortfolioValue();
  return value * 0.25; // Cap 25% per trade
}

// ✅ Daily loss cutoff
async function checkDailyDrawdown(getInitialBalanceFn) {
  const initial = await getInitialBalanceFn();
  const current = await getPortfolioValue();
  const drawdown = (initial - current) / initial;
  if (drawdown >= MAX_DAILY_LOSS) {
    throw new Error(`🚫 Max daily drawdown hit (${(drawdown * 100).toFixed(2)}%)`);
  }
  return drawdown;
}

// ✅ Dynamic risk scaling by volatility
function getDynamicRiskParameters(volatility) {
  return {
    risk: Math.min(RISK_PER_TRADE, 0.05 * (1 - volatility)),
    stopLossMultiplier: 1 + (volatility * 2)
  };
}

module.exports = {
  getPortfolioValue,
  calculatePositionSize,
  calculateVolatilityStop,
  validateRiskReward,
  calculateMaxPositionValue,
  checkDailyDrawdown,
  getDynamicRiskParameters
};
