import React, { useEffect, useState, useCallback  } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AverageProfits.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';

const AverageProfits = () => {
  const [userProfits, setUserProfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'avgProfit', direction: 'descending' });
  const userId = useSelector((state) => state.user.userId);
  const userRole = useSelector((state) => state.user.role); // Kullanıcı rolünü alıyoruz
  const [selectedOption, setSelectedOption] = useState('myInfluencers'); // Seçenek durumunu tutuyoruz

  const token = useSelector((state) => state.user.token);

  // Verileri çekme fonksiyonu
  const fetchAverageProfit = useCallback(async (url) => {
    setLoading(true);
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`, // JWT token ekleniyor
        },
      });
      if (selectedOption === 'myInfluencers') {
        setUserProfits(response.data.influencers);
      } else {
        setUserProfits([{ influencerName: 'Admin Influencers', avgProfit: response.data.averageProfit }]);
      }
    } catch (error) {
      console.error('Error fetching average profit:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedOption, setUserProfits, token]);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchAverageProfit(`https://cointracker-evt3.onrender.com/admin-influencers/average-profits`);
    } else if (selectedOption === 'myInfluencers') {
      fetchAverageProfit(`https://cointracker-evt3.onrender.com/appUser/${userId}/average-profits`);
    } else {
      fetchAverageProfit('https://cointracker-evt3.onrender.com/adminUser/admin-influencers/average-profits');
    }
  }, [userId, selectedOption, userRole, fetchAverageProfit]);


  // Sıralama fonksiyonu
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedUserProfits = [...userProfits].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? faSortUp : faSortDown;
    }
    return faSort;
  };

  return (
    <div className="average-profits-container">
      <header className="favorites-header">
        <h1>Average Profit/Loss Table</h1>
      </header>

      {userRole !== 'admin' && (
        <div className="options">
          <button onClick={() => setSelectedOption('myInfluencers')}>My Influencers</button>
          <button onClick={() => setSelectedOption('adminInfluencers')}>Admin Influencers</button>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
        </div>
      ) : (
        <table className="profits-table">
          <thead>
            <tr>
              <th>Influencer</th>
              <th onClick={() => handleSort('avgProfit')}>
                Average Profit (%){' '}
                <FontAwesomeIcon icon={getSortIcon('avgProfit')} />
              </th>
              <th onClick={() => handleSort('coinCount')}>
                Number of Coins{' '}
                <FontAwesomeIcon icon={getSortIcon('coinCount')} />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUserProfits.map((influencer, index) => (
              <tr key={index}>
                <td>
                  <Link to={`/user/${influencer.influencerId}`} className="user-link">
                    {influencer.influencerName}
                  </Link>
                </td>
                <td className={influencer.totalProfit > 0 ? 'profit-positive' : 'profit-negative'}>
                  {(influencer.totalProfit / influencer.coinCount).toFixed(2)}%
                </td>
                <td>{influencer.coinCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AverageProfits;
