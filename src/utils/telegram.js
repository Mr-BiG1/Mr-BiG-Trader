const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

let latestStatus = "🤖 Bot is starting up...";

function sendTelegramMessage(message) {
  if (!token || !chatId) {
    console.error(' Telegram token or chat ID missing');
    return;
  }

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
    .then(() => console.log('📤 Telegram message sent'))
    .catch(err => console.error('Telegram Send Failed:', err.message));
}

// 👂 Listen for /status command
bot.onText(/\/status/, (msg) => {
  if (msg.chat.id.toString() === chatId) {
    bot.sendMessage(chatId, `📊 Latest Bot Status:\n\n${latestStatus}`, { parse_mode: "Markdown" });
  }
});

// Update latestStatus from the main bot
function updateStatus(text) {
  latestStatus = text;
}

module.exports = { sendTelegramMessage, updateStatus };
