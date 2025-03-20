const validateData = (data) => {
    return data.length > 10 && 
           data.every(d => d.close > 0) &&
           new Date(data[0].timestamp) > Date.now() - 3600000;
  };
  
  module.exports = { validateData };