const fs = require('fs');
const path = require('path');

function logTrade({ action, symbol, price, qty, reason, confidence, status }) {
  const timestamp = new Date().toISOString();

  // 1. Log to human-readable TXT file
  const logEntry = `
[${timestamp}]
Action: ${action.toUpperCase()}
Symbol: ${symbol}
Price (approx): $${price}
Qty: ${qty}
Reason: ${reason}
Confidence: ${confidence}
Order Status: ${status}
---------------------------
`;
  const txtPath = path.join(__dirname, '../../logs/trade-log.txt');
  fs.appendFileSync(txtPath, logEntry);

  // 2. Log to structured JSON file (appendable array style)
  const tradeObject = {
    timestamp,
    action: action.toUpperCase(),
    symbol,
    price,
    qty,
    reason,
    confidence,
    status
  };

  const jsonPath = path.join(__dirname, '../../logs/trade-history.jsonl');
  fs.appendFileSync(jsonPath, JSON.stringify(tradeObject) + '\n');
}

module.exports = { logTrade };
