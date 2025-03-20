// function calculateRSI(closes, period = 14, round = 2) {
//   if (closes.length < period + 1) return { values: [], latest: null };

//   const deltas = closes.slice(1).map((v, i) => v - closes[i]);
//   let gains = 0, losses = 0;

//   for (let i = 0; i < period; i++) {
//     const delta = deltas[i];
//     if (delta >= 0) gains += delta;
//     else losses -= delta;
//   }

//   let avgGain = gains / period;
//   let avgLoss = losses / period;
//   const rsis = [];

//   for (let i = period; i < deltas.length; i++) {
//     const delta = deltas[i];
//     avgGain = (avgGain * (period - 1) + Math.max(delta, 0)) / period;
//     avgLoss = (avgLoss * (period - 1) + Math.max(-delta, 0)) / period;

//     const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
//     const rsi = 100 - (100 / (1 + rs));
//     rsis.push(Number(rsi.toFixed(round)));
//   }

//   return {
//     values: rsis,
//     latest: rsis[rsis.length - 1] ?? null
//   };
// }

function calculateRSI(closes, period = 14, round = 2) {
  if (closes.length < period + 1) return { values: [], latest: null };

  const deltas = closes.slice(1).map((v, i) => v - closes[i]);
  let gains = 0, losses = 0;

  for (let i = 0; i < period; i++) {
    const delta = deltas[i];
    if (delta >= 0) gains += delta;
    else losses -= delta;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rsis = [];

  for (let i = period; i < deltas.length; i++) {
    const delta = deltas[i];
    avgGain = (avgGain * (period - 1) + Math.max(delta, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-delta, 0)) / period;

    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    rsis.push(Number(rsi.toFixed(round)));
  }

  return {
    values: rsis,
    latest: rsis[rsis.length - 1] ?? null
  };
}

module.exports = { calculateRSI };
