const { getIntradayData } = require('./src/api/alphaVantage');
const { processStockData } = require('./src/services/dataProcessor');

const run = async () => {
  const rawData = await getIntradayData('AAPL');
  const data = processStockData(rawData);

  if (data.length === 0) {
    console.log('No data found.');
    return;
  }

  const latest = data[0];
  console.log('📊 Latest Stock Data:');
  console.log(`🕒 Time: ${latest.timestamp}`);
  console.log(`📈 Open: $${latest.open}`);
  console.log(`📉 Close: $${latest.close}`);
  console.log(`💹 High: $${latest.high} | Low: $${latest.low}`);
  console.log(`🔁 Volume: ${latest.volume}`);
};

run();
