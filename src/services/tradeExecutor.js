const { placeOrder } = require('../api/alpaca');
const { logTrade } = require('../utils/logger');

async function executeTrade({ action, data, parsed }) {
  if (action !== 'buy' && action !== 'sell') {
    console.log('⏳ ALGO: HOLD — waiting for better signal.');
    return;
  }

  const direction = action === 'buy' ? 'BUY' : 'SELL';
  console.log(`📌 ALGO: ${direction} signal detected. Executing...`);

  const result = await placeOrder('AAPL', 1, action);
  console.log(`📥 ${direction} Order Response:`, result);

  logTrade({
    action,
    symbol: 'AAPL',
    price: data[0].close,
    qty: 1,
    reason: parsed.reason,
    confidence: parsed.confidence,
    status: result?.status || 'unknown'
  });
}

module.exports = { executeTrade };
