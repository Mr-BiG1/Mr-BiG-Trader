// getChatId.mjs
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

(async () => {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (error) {
    console.error('Error fetching updates:', error.message);
  }
})();
