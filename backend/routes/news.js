// routes/news.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Haberleri çeken route
router.get('/', async (req, res) => {
  try {
    // RSS feed URL'lerini tanımlıyoruz
    const rssFeeds = [
      'https://coindesk.com/arc/outboundfeeds/rss/',
      'https://cointelegraph.com/rss'
    ];

    // RSS feed'leri fetch ediyoruz
    const allPromises = rssFeeds.map(feed =>
      axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${feed}`)
    );

    const responses = await Promise.all(allPromises);
    const allNews = responses.flatMap(response => response.data.items);

    res.json(allNews); // Haberleri JSON formatında döndürüyoruz
  } catch (error) {
    console.error('Haberler alınırken hata oluştu:', error);
    res.status(500).json({ message: 'Haberler alınırken hata oluştu' });
  }
});

module.exports = router;
