import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AverageProfits.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const AverageProfits = () => {
  const [userProfits, setUserProfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'avgProfit', direction: 'descending' });

  useEffect(() => {
    // Backend'den ortalama kâr/zarar verilerini ve coin sayısını çekme
    const fetchAverageProfits = async () => {
      try {
        const response = await axios.get('https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users/average-profits');
        setUserProfits(response.data);
      } catch (error) {
        console.error('Error fetching average profits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAverageProfits();
  }, []);

  // Sıralama fonksiyonu
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sıralama ayarına göre tabloyu sıralama
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
      {loading ? (
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin /> {/* Loading icon */}
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
            {sortedUserProfits.map((user) => (
              <tr key={user.userId}>
                <td>
                  <Link to={`/user/${user.userId}`} className="user-link">
                    {user.userName}
                  </Link>
                </td>
                <td className={user.avgProfit > 0 ? 'profit-positive' : 'profit-negative'}>
                  {user.avgProfit.toFixed(2)}%
                </td>
                <td>{user.coinCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AverageProfits;
