require('dotenv').config();
const cron = require('node-cron');
const { spawn } = require('child_process');

const { getIntradayData } = require('./src/api/alphaVantage');
const { processStockData, validateData } = require('./src/services/dataProcessor');
const { calculateRSI } = require('./src/indicators/rsi');
const { askOpenAI } = require('./src/api/openai');
const { executeTrade } = require('./src/services/tradeExecutor');
const { isMarketOpen } = require('./src/utils/marketTime');
const { sendTelegramMessage, updateStatus } = require('./src/utils/telegram');
const { fetchNewsForSymbol, hasCatalyst, analyzeNewsSentiment } = require('./src/api/news');
const { getTrendSignal } = require('./src/indicators/ema');
const { preTradeChecks } = require('./src/utils/preTradeChecks');
const { getPortfolioValue } = require('./src/utils/riskManagement');

const SYMBOL = process.env.TRADE_SYMBOL || 'AAPL';
const CRON_SCHEDULE = '*/5 * * * *';
const RISK_PER_TRADE = 0.01;
let lastTimestamp = null;

const validateAIResponse = (parsed) => {
  const validActions = ['buy', 'sell', 'hold'];
  const validConfidence = ['high', 'medium', 'low'];

  if (!validActions.includes(parsed.action?.toLowerCase())) {
    throw new Error(`Invalid action: ${parsed.action}`);
  }
  if (!validConfidence.includes(parsed.confidence?.toLowerCase())) {
    throw new Error(`Invalid confidence: ${parsed.confidence}`);
  }
  if (!parsed.reason || parsed.reason.length < 20) {
    throw new Error('Reason too short or missing');
  }
};

const predictPrice = (currentPrice) => {
  return new Promise((resolve, reject) => {
    if (!currentPrice || isNaN(currentPrice)) {
      console.warn("⚠️ Invalid current price passed to ML prediction.");
      return resolve(null);
    }

    const py = spawn('python', ['src/ml/ml_predictor.py', SYMBOL, currentPrice]);
    let output = '';
    py.stdout.on('data', (data) => output += data.toString());
    py.stderr.on('data', (err) => console.error("⚠️ Python Error:", err.toString()));
    py.on('close', () => {
      const match = output.match(/\$([\d.]+)/);
      const predictedPrice = match ? parseFloat(match[1]) : null;
      resolve(predictedPrice);
    });
  });
};

const run = async () => {
  try {
    console.log(`\n📅 ${new Date().toLocaleString()} — Starting analysis...`);
    updateStatus(`🤖 Bot is analyzing $${SYMBOL}...`);

    const marketOpen = await isMarketOpen();
    if (!marketOpen) {
      console.log('🌙 Market is closed — running in data-only mode.');
      updateStatus('🌙 Market is closed — fetching updates only.');
    }

    // Step 1: News Check
    console.log(`📰 Checking news for ${SYMBOL}...`);
    const news = await fetchNewsForSymbol(SYMBOL);
    const sentiment = analyzeNewsSentiment(news);
    const catalyst = hasCatalyst(news);

    if (sentiment < 0.3) {
      const failMsg = `📰 News sentiment too low for $${SYMBOL}\nSentiment: ${sentiment.toFixed(2)}/1.0`;
      console.log('🚫 Negative sentiment');
      await sendTelegramMessage(failMsg);
      updateStatus(failMsg);
      return;
    }

    if (!catalyst) {
      const warnMsg = `🟡 No catalyst for $${SYMBOL}, but sentiment is okay.\nSentiment: ${sentiment.toFixed(2)}/1.0\nProceeding...`;
      console.log('⚠️ No strong catalyst');
      await sendTelegramMessage(warnMsg);
      updateStatus(warnMsg);
    } else {
      const okMsg = `🟢 Strong news catalyst for $${SYMBOL}\nSentiment: ${sentiment.toFixed(2)}/1.0`;
      console.log('✅ Catalyst OK');
      await sendTelegramMessage(okMsg);
      updateStatus(okMsg);
    }

    // Step 2: Technical Data
    const rawData = await getIntradayData(SYMBOL);
    const data = processStockData(rawData);
    if (!validateData(data)) {
      console.log('❌ Invalid stock data.');
      await sendTelegramMessage('🛑 Data validation failed');
      updateStatus('🛑 Data validation failed.');
      return;
    }

    const currentData = data[0];
    if (currentData.timestamp === lastTimestamp) {
      console.log('🔁 Duplicate timestamp — skipping.');
      return;
    }
    lastTimestamp = currentData.timestamp;

    const closes = data.map(d => d.close);
    const rsiData = calculateRSI(closes);
    const rsi = rsiData.latest;
    const trend = getTrendSignal(closes);

    // ML Price Prediction
    const predictedPrice = await predictPrice(currentData.close);

    if (predictedPrice === null || isNaN(predictedPrice)) {
      const msg = `❌ ML prediction failed for $${SYMBOL}. Skipping this run.`;
      console.log(msg);
      await sendTelegramMessage(msg);
      updateStatus(msg);
      return;
    }

    // Summary Output
    console.log(`📊 Summary: Price: $${currentData.close}, RSI: ${rsi}, Trend: ${trend}`);
    updateStatus(
      `📊 Analyzing $${SYMBOL}\n` +
      `Price: $${currentData.close}\n` +
      `RSI: ${rsi} | Trend: ${trend}\n` +
      `🔮 ML Prediction: $${predictedPrice.toFixed(2)}`
    );

    // Step 3: Pre-Trade Checks
    const checksPassed = await preTradeChecks(data, rsi, trend);
    if (!checksPassed) return;

    // Step 4: Ask AI
    const prompt = `
Stock Analysis Request:
- Symbol: ${SYMBOL}
- Price: $${currentData.close}
- RSI(14): ${rsi}
- 50/200 EMA Trend: ${trend}
- Volume: ${currentData.volume.toLocaleString()}
- News Sentiment: ${sentiment.toFixed(2)}/1.0
- ML Predicted Price: $${predictedPrice.toFixed(2)}

Instructions:
1. Analyze technical setup, news sentiment, and ML prediction
2. Consider risk/reward ratio
3. Recommended action (buy/sell/hold)
4. Confidence level (high/medium/low)
5. Detailed reasoning

Response Format (JSON Only):
{
  "action": "buy|sell|hold",
  "confidence": "high|medium|low",
  "reason": "Detailed analysis...",
  "priceTarget": number,
  "stopLoss": number
}`;

    const aiResponse = await askOpenAI(prompt);
    const parsed = JSON.parse(aiResponse);
    validateAIResponse(parsed);

    // Step 5: Risk Management
    const portfolioValue = await getPortfolioValue();
    const positionSize = portfolioValue * RISK_PER_TRADE;
    const riskReward = (parsed.priceTarget - currentData.close) / (currentData.close - parsed.stopLoss);
    if (riskReward < 2) {
      const msg = `⚠️ Risk/Reward too low: ${riskReward.toFixed(2)}:1`;
      await sendTelegramMessage(msg);
      updateStatus(msg);
      return;
    }

    // Step 6: Execute Trade (only if market is open)
    if (marketOpen) {
      const tradeResult = await executeTrade({
        symbol: SYMBOL,
        action: parsed.action,
        quantity: Math.floor(positionSize / currentData.close),
        price: currentData.close,
        stopLoss: parsed.stopLoss,
        takeProfit: parsed.priceTarget
      });

      const summary =
        `✅ Trade Executed: ${SYMBOL}\n` +
        `• Action: ${parsed.action.toUpperCase()}\n` +
        `• Quantity: ${tradeResult.quantity} shares\n` +
        `• Entry: $${currentData.close}\n` +
        `• SL: $${parsed.stopLoss} | TP: $${parsed.priceTarget}\n` +
        `• Reason: ${parsed.reason}`;

      await sendTelegramMessage(summary);
      updateStatus(
        `Last Action: ${parsed.action.toUpperCase()}\n` +
        `Current Price: $${currentData.close}\n` +
        `ML Predicted: $${predictedPrice.toFixed(2)}\n` +
        `Portfolio Value: $${portfolioValue.toFixed(2)}\n` +
        `Next Check: ${new Date(Date.now() + 5 * 60000).toLocaleTimeString()}`
      );
    } else {
      const summary =
        `ℹ️ Market closed — trade not executed.\n` +
        `Recommended Action: ${parsed.action.toUpperCase()}\n` +
        `TP: $${parsed.priceTarget} | SL: $${parsed.stopLoss}\n` +
        `Reason: ${parsed.reason}`;

      await sendTelegramMessage(summary);
      updateStatus(
        `Pending Action: ${parsed.action.toUpperCase()}\n` +
        `Price: $${currentData.close} | ML: $${predictedPrice.toFixed(2)}\n` +
        `Portfolio: $${portfolioValue.toFixed(2)}\n` +
        `Market Closed — Awaiting open`
      );
    }
  } catch (err) {
    console.error('🔥 Error in run:', err);
    await sendTelegramMessage(`🚨 Critical Error: ${err.message}`);
    updateStatus(`🔥 Error: ${err.message}`);
  }
};

// Schedule it
cron.schedule(CRON_SCHEDULE, run, { timezone: 'America/New_York' });

// Run immediately in dev
if (process.env.NODE_ENV === 'development') run();
