// src/utils/preTradeChecks.js

const { isHighVolatilityPeriod } = require('./marketTime');
const { sendTelegramMessage } = require('./telegram');

/**
 * Performs pre-trade validation checks before any buy/sell decision.
 * @param {Array} data - Processed intraday stock data
 * @param {number} rsi - Latest RSI value
 * @param {string} trend - Detected trend (bullish, bearish, neutral)
 * @returns {Promise<boolean>} - Returns false if any check fails
 */
const preTradeChecks = async (data, rsi, trend) => {
  const checks = [
    {
      condition: data[0].volume < 1000000,
      message: `Low volume (${data[0].volume})`
    },
    {
      condition: rsi > 70 || rsi < 30,
      message: `RSI at extreme (${rsi})`
    },
    {
      condition: await isHighVolatilityPeriod(),
      message: 'High volatility period'
    },
    {
      condition: trend === 'neutral',
      message: 'No clear trend'
    }
  ];

  const failedChecks = checks.filter(check => check.condition);
  if (failedChecks.length > 0) {
    await sendTelegramMessage(
      `🚧 Trade skipped due to:\n${failedChecks.map(c => `• ${c.message}`).join('\n')}`
    );
    return false;
  }
  return true;
};

module.exports = { preTradeChecks };
