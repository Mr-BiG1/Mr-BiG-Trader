# 🤖 DSG Trade Bot

A fully automated AI-powered stock trading bot that uses **technical analysis**, **market data**, and **OpenAI reasoning** to make real-time **buy/sell/hold decisions**. Built with Node.js and powered by the **Alpaca Broker API**, this bot places trades, logs activity, and notifies you via **Telegram**.

---

## 🚀 Features

- 📈 Live Market Data – Fetches real-time intraday data from AlphaVantage.
- 📊 RSI Calculation – Uses Relative Strength Index to detect oversold or overbought conditions.
- 🧠 OpenAI-Powered Decisions – Uses GPT-4 Turbo to recommend buy, sell, or hold.
- 💸 Automated Trading – Executes orders via Alpaca based on AI output.
- 🗂 Smart Logging – Records every trade with reasoning, timestamp, confidence, and status.
- 📩 Telegram Alerts – Sends alerts to your Telegram bot for every decision and trade.
- 🔒 Sell Safety Check – Verifies position before selling to avoid errors.

---

## ⚙️ Tech Stack

- Node.js  
- Alpaca API – For placing trades  
- AlphaVantage API – For stock data  
- OpenAI API – For trade decisions  
- Telegram Bot API – For notifications  
- Cron – Scheduled execution every 5 minutes

---

## 📂 Project Structure

.  
├── src  
│   ├── api                # AlphaVantage, Alpaca, OpenAI integration  
│   ├── services           # RSI, trade execution  
│   ├── utils              # Logger, Telegram, market time checker  
│   └── config             # Constants or setup (if needed)  
├── logs                  # Auto-generated trade logs  
├── .env                  # Your secret credentials  
└── app.js                # Main runner (entry point)

---

## 📄 Setup

1. Clone the repository:

   git clone https://github.com/your-username/trading-bot.git  
   cd trading-bot

2. Install dependencies:

   npm install

3. Create a `.env` file:

   ALPHA_VANTAGE_API_KEY=your_alpha_key  
   APCA_API_KEY_ID=your_alpaca_key  
   APCA_API_SECRET_KEY=your_alpaca_secret  
   APCA_API_BASE_URL=https://paper-api.alpaca.markets  
   OPENAI_API_KEY=your_openai_key  
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token  
   TELEGRAM_CHAT_ID=your_telegram_chat_id

> ✅ Make sure your Alpaca account is in paper trading mode.

4. Run the bot:

   node app.js

> ⏰ It runs every 5 minutes by default (via `node-cron`).

---

## 📬 Telegram Alerts

You’ll get Telegram updates like:

📈 AAPL Signal  
🕒 2025-03-13 13:25  
💵 Price: $217.48  
📊 RSI: 64.11  
✅ Action: SELL  
📝 Reason: RSI approaching overbought level, price may correct.

---

## 🔐 Safety Features

- Executes a SELL only if you hold the asset.
- Skips duplicate trades using timestamp comparison.
- Cron-based scheduler avoids repeated unnecessary runs.

---

## 📌 Roadmap

- [ ] Multi-stock support  
- [ ] P/L summary  
- [ ] Stop-loss + trailing stop  
- [ ] Backtesting engine  
- [ ] Web dashboard

---

## 👨‍💼 Author

Made with ❤️ by **Darsan Sabu George**  
GitHub: [Mr-BiG1](https://github.com/Mr-BiG1)  
Telegram Bot: [@dsg_trade_bot](https://t.me/dsg_trade_bot)

---

## ⚠️ Disclaimer

This bot is for educational purposes only.  
Stock trading involves risk. Use paper trading to test, and consult a financial advisor before real investing.

