const fs = require('fs');
const path = require('path');

function logTrade({ action, symbol, price, qty, reason, confidence, status }) {
  const timestamp = new Date().toISOString();

  //  Human-readable text log
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

  //  Structured JSONL log
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

  const jsonLogPath = path.join(__dirname, '../../logs/trade-history.jsonl');
  fs.appendFileSync(jsonLogPath, JSON.stringify(tradeObject) + '\n');
}

module.exports = { logTrade };
