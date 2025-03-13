const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(token);

function sendTelegramMessage(message) {
  if (!token || !chatId) {
    console.error('Telegram token or chat ID missing');
    return;
  }

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
    .then(() => console.log('Telegram message sent'))
    .catch(err => console.error('Telegram Send Failed:', err.message));
}

module.exports = { sendTelegramMessage };
