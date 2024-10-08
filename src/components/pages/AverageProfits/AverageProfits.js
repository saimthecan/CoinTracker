// src/components/pages/AverageProfits/AverageProfits.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AverageProfits.css';

const AverageProfits = () => {
  const [userProfits, setUserProfits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Backend'den ortalama kâr/zarar verilerini çekme
    const fetchAverageProfits = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users/average-profits');
        setUserProfits(response.data);
      } catch (error) {
        console.error('Ortalama kârlar alınırken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAverageProfits();
  }, []);

  return (
    <div className="average-profits-container">
      <h1>Influencer'ların Ortalama Kâr/Zararları</h1>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table className="profits-table">
          <thead>
            <tr>
              <th>Influencer</th>
              <th>Ortalama Kâr (%)</th>
            </tr>
          </thead>
          <tbody>
            {userProfits.map((user) => (
              <tr key={user.userId}>
                <td>
                  <Link to={`/user/${user.userId}`}>{user.userName}</Link>
                </td>
                <td>{user.avgProfit.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AverageProfits;
