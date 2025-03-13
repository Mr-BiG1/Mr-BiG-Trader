require('dotenv').config();
const cron = require('node-cron');

const { getIntradayData } = require('./src/api/alphaVantage');
const { processStockData } = require('./src/services/dataProcessor');
const { calculateRSI } = require('./src/indicators/rsi');
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
    console.log(' No data found.');
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
run(); 
    