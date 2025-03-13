const fs = require('fs');
const path = require('path');


const filePath = path.join(__dirname, 'logs', 'trade-history.jsonl');

function analyzeLogs() {
  const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
  const trades = lines.map(line => JSON.parse(line));

  trades.forEach((trade, i) => {
    console.log(`\n🧾 TRADE #${i + 1}`);
    console.log(`📅 ${trade.timestamp}`);
    console.log(`🔄 ${trade.action} ${trade.qty}x ${trade.symbol} @ $${trade.price}`);
    console.log(`💬 ${trade.reason}`);
    console.log(`📈 Confidence: ${trade.confidence}`);
    console.log(`📦 Status: ${trade.status}`);
  });
}

analyzeLogs();
