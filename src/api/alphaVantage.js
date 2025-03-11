const axios = require('axios');
require('dotenv').config();

const getIntradayData = async (symbol = 'AAPL') => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
  try {
    const response = await axios.get(url);
    return response.data['Time Series (5min)'];
  } catch (err) {
    console.error('API Error:', err.message);
    return null;
  }
};

module.exports = { getIntradayData };
