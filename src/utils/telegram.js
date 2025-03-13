const fetch = require('node-fetch');
require('dotenv').config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(message) {
  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    console.warn("Telegram credentials not set in .env");
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });

    const data = await res.json();
    if (!data.ok) {
      console.error(" Telegram Error:", data.description);
    }
  } catch (error) {
    console.error(" Telegram Send Failed:", error.message);
  }
}

module.exports = { sendTelegramMessage };
