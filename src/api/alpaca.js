require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.APCA_API_BASE_URL;
console.log('🔑 Alpaca Key:', process.env.APCA_API_KEY_ID);
console.log('🔐 Alpaca Secret:', process.env.APCA_API_SECRET_KEY);

const alpaca = axios.create({
  baseURL: BASE_URL,
  headers: {
    'APCA-API-KEY-ID': process.env.APCA_API_KEY_ID,
    'APCA-API-SECRET-KEY': process.env.APCA_API_SECRET_KEY,
    'Content-Type': 'application/json'
  }
});

// PLACE ORDER
async function placeOrder(symbol, qty, side, type = 'market', time_in_force = 'gtc') {
  try {
    const response = await alpaca.post('/v2/orders', {
      symbol,
      qty,
      side,
      type,
      time_in_force
    });
    return response.data;
  } catch (error) {
    console.error(' Error placing order:', error.response?.data || error.message);
    return null;
  }
}

module.exports = { placeOrder };
