// const axios = require('axios');
// require('dotenv').config();

// const getIntradayData = async (symbol = 'AAPL') => {
//   const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
//   try {
//     const response = await axios.get(url);
//     return response.data['Time Series (5min)'];
//   } catch (err) {
//     console.error('API Error:', err.message);
//     return null;
//   }
// };

// module.exports = { getIntradayData };


const axios = require('axios');
require('dotenv').config();

const getIntradayData = async (symbol = 'AAPL') => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

  try {
    const response = await axios.get(url);
    const rawData = response.data['Time Series (5min)'];

    if (!rawData) {
      console.error('❌ No data returned from Alpha Vantage');
      return [];
    }

    // Convert the nested object into sorted array
    const formattedData = Object.entries(rawData).map(([timestamp, values]) => ({
      timestamp,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'], 10),
    }));

    // Sort by most recent first
    return formattedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  } catch (err) {
    console.error('🔻 Alpha Vantage API Error:', err.message);
    return [];
  }
};

module.exports = { getIntradayData };
