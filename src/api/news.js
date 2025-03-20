// require('dotenv').config();
// const axios = require('axios');

// const NEWS_API_KEY = process.env.NEWSAPI_KEY;

// async function fetchNewsForSymbol(symbol = "Apple") {
//   try {
//     const today = new Date().toISOString().split("T")[0];
//     const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(symbol)}&from=${today}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;

//     const res = await axios.get(url);
//     return res.data.articles || [];
//   } catch (err) {
//     console.error("📰 News Fetch Error:", err.message);
//     return [];
//   }
// }

// function hasCatalyst(newsArticles) {
//   if (!newsArticles.length) return false;

//   const keywords = ["earnings", "merger", "upgrade", "buyback", "lawsuit", "growth", "layoff"];
//   return newsArticles.some(article =>
//     keywords.some(kw => article.title?.toLowerCase().includes(kw) || article.description?.toLowerCase().includes(kw))
//   );
// }

// module.exports = { fetchNewsForSymbol, hasCatalyst };


require('dotenv').config();
const axios = require('axios');

const NEWS_API_KEY = process.env.NEWSAPI_KEY;

async function fetchNewsForSymbol(symbol = "Apple") {
  try {
    const today = new Date().toISOString().split("T")[0];
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(symbol)}&from=${today}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
    const res = await axios.get(url);
    return res.data.articles || [];
  } catch (err) {
    console.error("📰 News Fetch Error:", err.message);
    return [];
  }
}

function hasCatalyst(newsArticles) {
  if (!newsArticles.length) return false;

  const keywords = ["earnings", "merger", "upgrade", "buyback", "lawsuit", "growth", "layoff"];
  return newsArticles.some(article =>
    keywords.some(kw =>
      article.title?.toLowerCase().includes(kw) ||
      article.description?.toLowerCase().includes(kw)
    )
  );
}

// ✅ Add this function
function analyzeNewsSentiment(newsArticles) {
  const positiveWords = ['growth', 'beats', 'surge', 'strong', 'positive', 'gain', 'record'];
  const negativeWords = ['fall', 'loss', 'down', 'miss', 'negative', 'weak', 'lawsuit'];

  let score = 0;
  let count = 0;

  for (const article of newsArticles) {
    const content = `${article.title || ''} ${article.description || ''}`.toLowerCase();
    let articleScore = 0;

    positiveWords.forEach(word => {
      if (content.includes(word)) articleScore += 1;
    });

    negativeWords.forEach(word => {
      if (content.includes(word)) articleScore -= 1;
    });

    score += articleScore;
    count++;
  }

  // Normalize score to 0–1 range
  if (count === 0) return 0.5;
  const normalized = (score / (count * 2)) + 0.5;
  return Math.min(Math.max(normalized, 0), 1);
}

module.exports = {
  fetchNewsForSymbol,
  hasCatalyst,
  analyzeNewsSentiment // ✅ make sure to export it
};
