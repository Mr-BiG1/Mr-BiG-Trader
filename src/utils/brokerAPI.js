// src/utils/brokerAPI.js

const axios = require('axios');
require('dotenv').config();

const alpaca = axios.create({
  baseURL: process.env.APCA_API_BASE_URL,
  headers: {
    'APCA-API-KEY-ID': process.env.APCA_API_KEY_ID,
    'APCA-API-SECRET-KEY': process.env.APCA_API_SECRET_KEY,
    'Content-Type': 'application/json'
  }
});

async function getPortfolioValue() {
  try {
    const res = await alpaca.get('/v2/account');
    const equity = parseFloat(res.data.equity);
    return equity;
  } catch (err) {
    console.error('❌ Error fetching portfolio value:', err.response?.data || err.message);
    return 0;
  }
}

module.exports = {
  getPortfolioValue
};
