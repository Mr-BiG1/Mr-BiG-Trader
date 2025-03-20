const { placeOrder, hasPosition, getAccountDetails } = require('../api/alpaca');
const { logTrade } = require('../utils/logger');
const {
  calculatePositionSize,
  validateRiskReward,
  checkDailyDrawdown,
  calculateVolatilityStop
} = require('../utils/riskManagement');
const { sendTelegramMessage } = require('../utils/telegram');

async function executeTrade({ action, data, parsed, symbol = 'AAPL' }) {
  try {
    // 1. Daily Drawdown Check
    await checkDailyDrawdown();

    // 2. Validate Action
    if (!['buy', 'sell'].includes(action)) {
      await sendTelegramMessage(`🛑 Invalid action: ${action}`);
      return;
    }

    // 3. Get Market Data
    const currentPrice = data[0].close;
    const historicalData = data.slice(-30); // Last 30 periods for volatility

    // 4. Calculate Risk Parameters
    const { stopLoss, takeProfit } = parsed;
    const volatilityStop = calculateVolatilityStop(historicalData);

    // Use tighter of two stop levels
    const finalStopLoss = action === 'buy'
      ? Math.max(stopLoss, volatilityStop.longStop)
      : Math.min(stopLoss, volatilityStop.shortStop);

    // 5. Validate Risk/Reward
    if (!validateRiskReward(currentPrice, finalStopLoss, takeProfit)) {
      await sendTelegramMessage(
        `⚠️ Risk/Reward too low for ${action.toUpperCase()}\n` +
        `Entry: $${currentPrice} | SL: $${finalStopLoss} | TP: $${takeProfit}`
      );
      return;
    }

    // 6. Calculate Position Size
    const portfolioValue = await getAccountDetails().then(acc => acc.equity);
    const qty = calculatePositionSize(currentPrice, finalStopLoss, portfolioValue);

    if (qty < 1) {
      await sendTelegramMessage(`⚠️ Position too small (${qty} shares)`);
      return;
    }

    // 7. Check Existing Positions
    if (action === 'sell') {
      const currentPosition = await hasPosition(symbol);
      if (!currentPosition || currentPosition.qty < qty) {
        await sendTelegramMessage(
          `🚫 Insufficient ${symbol} shares for selling\n` +
          `Requested: ${qty} | Available: ${currentPosition?.qty || 0}`
        );
        return;
      }
    }

    // 8. Execute Order with OCO (One-Cancels-Other)
    const orderResult = await placeOrder({
      symbol,
      qty,
      side: action,
      type: 'limit',
      limit_price: currentPrice.toFixed(2),
      stop_loss: finalStopLoss.toFixed(2),
      take_profit: takeProfit.toFixed(2)
    });

    // 9. Log Trade
    logTrade({
      action,
      symbol,
      price: currentPrice,
      qty,
      stopLoss: finalStopLoss,
      takeProfit,
      reason: parsed.reason,
      confidence: parsed.confidence,
      status: orderResult.status,
      orderId: orderResult.id
    });

    // 10. Send Confirmation
    await sendTelegramMessage(
      `✅ ${action.toUpperCase()} Order Executed\n` +
      `• Symbol: ${symbol}\n` +
      `• Shares: ${qty}\n` +
      `• Price: $${currentPrice}\n` +
      `• SL: $${finalStopLoss} | TP: $${takeProfit}\n` +
      `• Order ID: ${orderResult.id.slice(-6)}`
    );

  } catch (error) {
    console.error('Trade Execution Error:', error);
    await sendTelegramMessage(
      `🚨 Trade Failed: ${error.message}\n` +
      `Action: ${action} | Symbol: ${symbol}`
    );
  }
}

module.exports = { executeTrade };
