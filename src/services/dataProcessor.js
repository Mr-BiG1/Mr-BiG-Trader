// const processStockData = (rawData) => {
//     if (!rawData) return [];
  
//     const dataPoints = Object.entries(rawData).map(([timestamp, values]) => ({
//       timestamp,
//       open: parseFloat(values['1. open']),
//       high: parseFloat(values['2. high']),
//       low: parseFloat(values['3. low']),
//       close: parseFloat(values['4. close']),
//       volume: parseInt(values['5. volume']),
//     }));
  
//     // Optional: sort by time (descending)
//     dataPoints.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
//     return dataPoints;
//   };
  
//   module.exports = { processStockData };
const processStockData = (rawData) => {
  if (!rawData) return [];

  const dataPoints = Object.entries(rawData).map(([timestamp, values]) => ({
    timestamp,
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseInt(values['5. volume']),
  }));

  // Sort newest to oldest
  dataPoints.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return dataPoints;
};

const validateData = (data) => {
  return Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0].close === 'number';
};

module.exports = {
  processStockData,
  validateData
};
