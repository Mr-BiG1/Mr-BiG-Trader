function isMarketOpen() {
    const now = new Date();
    const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    const totalMinutes = hour * 60 + minute;
    return day >= 1 && day <= 5 && totalMinutes >= 870 && totalMinutes < 1260;
  }
  
  module.exports = { isMarketOpen };
  