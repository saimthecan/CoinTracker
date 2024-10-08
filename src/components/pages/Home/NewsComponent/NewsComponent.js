import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './NewsComponent.css';
import parse from 'html-react-parser';

const NewsComponent = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const rssFeeds = [
          'https://coindesk.com/arc/outboundfeeds/rss/',
          'https://cointelegraph.com/rss',
        ];

        const allPromises = rssFeeds.map(feed =>
          axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${feed}`)
        );

        const responses = await Promise.all(allPromises);
        const allNews = responses.flatMap(response => response.data.items);
        setNewsItems(allNews);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const removeDuplicateImages = (htmlContent) => {
    // Sadece ilk img'yi döndürüyor ve diğerlerini filtreliyor.
    return htmlContent.replace(/<img[^>]*>/g, (match, index) => (index === 0 ? match : ''));
  };

  if (loading) {
    return <div className="news-container">Loading news...</div>;
  }

  if (error) {
    return <div className="news-container">Unable to load news at this time.</div>;
  }

  return (
    <div className="news-container">
      <header className="favorites-header">
        <h1>Latest Crypto News</h1>
      </header>
      <div className="news-list">
        {newsItems.map((news, index) => (
          <div key={index} className="news-item">
            {news.enclosure && news.enclosure.link && (
              <img src={news.enclosure.link} alt={news.title} className="news-image" />
            )}
            <a href={news.link} target="_blank" rel="noopener noreferrer" className="news-title">
              {news.title}
            </a>
            <p className="news-date">
              {new Date(news.pubDate).toLocaleDateString()} {new Date(news.pubDate).toLocaleTimeString()}
            </p>
            <p className="news-author">by {news.author || 'Unknown'}</p>
            <div className="news-description">{parse(removeDuplicateImages(news.description))}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsComponent;
