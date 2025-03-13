// require('dotenv').config();
// const cron = require('node-cron');
// const { getIntradayData } = require('./src/api/alphaVantage');
// const { processStockData } = require('./src/services/dataProcessor');
// const { calculateRSI } = require('./src/indicators/rsi');
// const { askOpenAI } = require('./src/api/openai');
// const { placeOrder } = require('./src/api/alpaca');
// const { logTrade } = require('./src/utils/logger');

// // ⏰ Market hours check: Mon–Fri, 9:30 AM–4 PM EST (14:30–21:00 UTC)
// function isMarketOpen() {
//   const now = new Date();
//    // 0 = Sunday, 6 = Saturday
//   const day = now.getUTCDay();
//   const hour = now.getUTCHours();
//   const minute = now.getUTCMinutes();
//   const totalMinutes = hour * 60 + minute;

//   return day >= 1 && day <= 5 && totalMinutes >= 870 && totalMinutes < 1260;
// }

// const run = async () => {
//   if (!isMarketOpen()) {
//     console.log('⏳ Market is closed. Skipping run...');
//     return;
//   }

//   console.log('📡 Running AI Trading Bot...');

//   const rawData = await getIntradayData('AAPL');
//   const data = processStockData(rawData);

//   if (data.length === 0) {
//     console.log(' No data found.');
//     return;
//   }

//   const closes = data.map(d => d.close);
//   const rsi = calculateRSI(closes);

//   console.log('📊 Latest Stock Data:');
//   console.log(`🕒 Time: ${data[0].timestamp}`);
//   console.log(`📈 Open: $${data[0].open}`);
//   console.log(`📉 Close: $${data[0].close}`);
//   console.log(`💹 High: $${data[0].high} | Low: $${data[0].low}`);
//   console.log(`🔁 Volume: ${data[0].volume}`);
//   console.log(`📊 RSI (14): ${rsi || 'Not enough data'}`);

//   const prompt = `
// Stock: AAPL
// Time: ${data[0].timestamp}
// Price: $${data[0].close}
// RSI (14): ${rsi}
// Volume: ${data[0].volume}

// Based on the technical indicators and market condition above, should I buy, sell, or hold this stock? Return ONLY a valid JSON response like this:
// {
//   "action": "buy",
//   "confidence": "high",
//   "reason": "RSI is very low, indicating oversold condition."
// }
// `;

//   const aiResponse = await askOpenAI(prompt);

//   try {
//     const parsed = JSON.parse(aiResponse);

//     console.log('\n🎯 Structured AI Output:');
//     console.log(`🔘 Action: ${parsed.action}`);
//     console.log(`📊 Confidence: ${parsed.confidence}`);
//     console.log(`📝 Reason: ${parsed.reason}`);

//     if (parsed.action === 'buy') {
//       console.log('✅ ALGO: BUY signal detected.');
//       const result = await placeOrder('AAPL', 1, 'buy');
//       console.log('📥 Buy Order Response:', result);

//       logTrade({
//         action: parsed.action,
//         symbol: 'AAPL',
//         price: data[0].close,
//         qty: 1,
//         reason: parsed.reason,
//         confidence: parsed.confidence,
//         status: result?.status || 'unknown'
//       });

//     } else if (parsed.action === 'sell') {
//       console.log('⚠️ ALGO: SELL signal detected.');
//       const result = await placeOrder('AAPL', 1, 'sell');
//       console.log('📤 Sell Order Response:', result);

//       logTrade({
//         action: parsed.action,
//         symbol: 'AAPL',
//         price: data[0].close,
//         qty: 1,
//         reason: parsed.reason,
//         confidence: parsed.confidence,
//         status: result?.status || 'unknown'
//       });

//     } else {
//       console.log('⏳ ALGO: HOLD — waiting for better signal.');
//     }

//   } catch (error) {
//     console.log('\n❌ Failed to parse AI response as JSON. Raw output:');
//     console.log(aiResponse);
//   }
// };

// // 🕒 Run every 5 minutes
// cron.schedule('*/5 * * * *', () => {
//   run();
// });

// // Run once immediately (optional)
// run();


require('dotenv').config();
const cron = require('node-cron');

const { getIntradayData } = require('./src/api/alphaVantage');
const { processStockData } = require('./src/services/dataProcessor');
const { calculateRSI } = require('./src/services/rsi');
const { askOpenAI } = require('./src/api/openai');
const { executeTrade } = require('./src/services/tradeExecutor');
const { isMarketOpen } = require('./src/utils/marketTime');

const run = async () => {
  if (!isMarketOpen()) {
    console.log('⏳ Market closed. Skipping.');
    return;
  }

  console.log('🚀 Running Trading Bot...');

  const rawData = await getIntradayData('AAPL');
  const data = processStockData(rawData);

  if (data.length === 0) {
    console.log('❌ No data found.');
    return;
  }

  const closes = data.map(d => d.close);
  const rsi = calculateRSI(closes);

  console.log('📊 Stock Summary:');
  console.log(`🕒 ${data[0].timestamp} | 💹 Close: $${data[0].close} | RSI: ${rsi}`);

  const prompt = `
Stock: AAPL
Time: ${data[0].timestamp}
Price: $${data[0].close}
RSI (14): ${rsi}
Volume: ${data[0].volume}

Based on the technical indicators above, should I buy, sell, or hold this stock? Return ONLY JSON:
{
  "action": "buy",
  "confidence": "high",
  "reason": "RSI is very low, indicating oversold condition."
}
`;

  try {
    const aiResponse = await askOpenAI(prompt);
    const parsed = JSON.parse(aiResponse);
    await executeTrade({ action: parsed.action, data, parsed });
  } catch (error) {
    console.log('❌ Error parsing AI response:', error.message);
  }
};

// Run every 5 minutes
cron.schedule('*/5 * * * *', () => run());
run(); // Optional initial run
    