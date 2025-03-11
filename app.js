require('dotenv').config();
const { getIntradayData } = require('./src/api/alphaVantage');
const { processStockData } = require('./src/services/dataProcessor');
const { calculateRSI } = require('./src/indicators/rsi');
const { askOpenAI } = require('./src/api/openai');
const { placeOrder } = require('./src/api/alpaca');
const { logTrade } = require('./src/utils/logger');


const run = async () => {
    const rawData = await getIntradayData('AAPL');
    const data = processStockData(rawData);

    if (data.length === 0) {
        console.log('No data found.');
        return;
    }

    const closes = data.map(d => d.close);
    const rsi = calculateRSI(closes);

    console.log('📊 Latest Stock Data:');
    console.log(`🕒 Time: ${data[0].timestamp}`);
    console.log(`📈 Open: $${data[0].open}`);
    console.log(`📉 Close: $${data[0].close}`);
    console.log(`💹 High: $${data[0].high} | Low: $${data[0].low}`);
    console.log(`🔁 Volume: ${data[0].volume}`);
    console.log(`📊 RSI (14): ${rsi || 'Not enough data'}`);

    const prompt = `
Stock: AAPL
Time: ${data[0].timestamp}
Price: $${data[0].close}
RSI (14): ${rsi}
Volume: ${data[0].volume}

Based on the technical indicators and market condition above, should I buy, sell, or hold this stock? Return ONLY a valid JSON response like this:
{
  "action": "buy",
  "confidence": "high",
  "reason": "RSI is very low, indicating oversold condition."
}
`;

    const aiResponse = await askOpenAI(prompt);

    try {
        const parsed = JSON.parse(aiResponse);

        console.log('\n🎯 Structured AI Output:');
        console.log(`🔘 Action: ${parsed.action}`);
        console.log(`📊 Confidence: ${parsed.confidence}`);
        console.log(`📝 Reason: ${parsed.reason}`);

        // Decision logic (optional)
        if (parsed.action === 'buy') {
            console.log(' ALGO: Consider BUYING based on AI analysis.');
        } else if (parsed.action === 'sell') {
            console.log(' ALGO: Consider SELLING or exiting position.');
        } else {
            console.log('⏳ ALGO: Hold — wait for a clearer signal.');
        }
        if (parsed.action === 'buy') {
            console.log(' ALGO: Placing BUY order...');
            const result = await placeOrder('AAPL', 1, 'buy');
            console.log('📥 Order Response:', result);

            //  Log the trade
            logTrade({
                action: parsed.action,
                symbol: 'AAPL',
                price: data[0].close,
                qty: 1,
                reason: parsed.reason,
                confidence: parsed.confidence,
                status: result?.status || 'unknown'
            });
        }

    } catch (error) {
        console.log('\n Failed to parse AI response as JSON. Raw output:');
        console.log(aiResponse);
    }
};

run();
