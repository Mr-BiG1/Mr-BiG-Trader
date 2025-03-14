// const { placeOrder } = require('../api/alpaca');
// const { logTrade } = require('../utils/logger');

// async function executeTrade({ action, data, parsed }) {
//   if (action !== 'buy' && action !== 'sell') {
//     console.log('⏳ ALGO: HOLD — waiting for better signal.');
//     return;
//   }

//   const direction = action === 'buy' ? 'BUY' : 'SELL';
//   console.log(`📌 ALGO: ${direction} signal detected. Executing...`);

//   const result = await placeOrder('AAPL', 1, action);
//   console.log(`📥 ${direction} Order Response:`, result);

//   logTrade({
//     action,
//     symbol: 'AAPL',
//     price: data[0].close,
//     qty: 1,
//     reason: parsed.reason,
//     confidence: parsed.confidence,
//     status: result?.status || 'unknown'
//   });
// }

// module.exports = { executeTrade };

const { placeOrder, hasPosition } = require('../api/alpaca');
const { logTrade } = require('../utils/logger');

async function executeTrade({ action, data, parsed }) {
  const symbol = 'AAPL';
  const qty = 1;

  if (action !== 'buy' && action !== 'sell') {
    console.log('⏳ ALGO: HOLD — waiting for better signal.');
    return;
  }

  const direction = action.toUpperCase();
  console.log(`📌 ALGO: ${direction} signal detected. Executing...`);

  // Check for position before selling
  if (action === 'sell') {
    const hasAAPL = await hasPosition(symbol);
    if (!hasAAPL) {
      console.log(` Cannot SELL — No ${symbol} shares owned.`);
      return;
    }
  }

  const result = await placeOrder(symbol, qty, action);

  console.log(`📥 ${direction} Order Response:`, result);

  //  Log the trade
  logTrade({
    action,
    symbol,
    price: data[0].close,
    qty,
    reason: parsed.reason,
    confidence: parsed.confidence,
    status: result?.status || 'unknown'
  });
}

module.exports = { executeTrade };
