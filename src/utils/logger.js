const fs = require('fs');
const path = require('path');

function logTrade({ action, symbol, price, qty, reason, confidence, status }) {
  const logEntry = `
[${new Date().toISOString()}]
Action: ${action.toUpperCase()}
Symbol: ${symbol}
Price (approx): $${price}
Qty: ${qty}
Reason: ${reason}
Confidence: ${confidence}
Order Status: ${status}
---------------------------
`;

  const logPath = path.join(__dirname, '../../logs/trade-log.txt');
  fs.appendFileSync(logPath, logEntry);
}

module.exports = { logTrade };
