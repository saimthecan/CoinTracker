import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./AverageProfits.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";

const AverageProfits = () => {
  const [userProfits, setUserProfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "avgProfit",
    direction: "descending",
  });
  const userId = useSelector((state) => state.user.userId);

  useEffect(() => {
    const fetchAverageProfit = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/appUser/${userId}/average-profits`
        );

        // avgProfit değerini hesaplayarak yeni bir dizi oluşturuyoruz
        const processedData = response.data.influencers.map((influencer) => ({
          ...influencer,
          avgProfit:
            influencer.coinCount > 0
              ? influencer.totalProfit / influencer.coinCount
              : 0, // coinCount sıfırsa avgProfit'i 0 olarak ayarlıyoruz
        }));
        setUserProfits(processedData);
      } catch (error) {
        console.error("Error fetching average profit:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAverageProfit();
  }, [userId]);

  // Sıralama fonksiyonu
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

   // coinCount > 0 olan influencerları filtreliyoruz
   const filteredUserProfits = userProfits.filter((influencer) => influencer.coinCount > 0);

  // Sıralama ayarına göre tabloyu sıralama
  const sortedUserProfits = [...filteredUserProfits].sort((a, b) => {
    if (parseFloat(a[sortConfig.key]) < parseFloat(b[sortConfig.key])) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (parseFloat(a[sortConfig.key]) > parseFloat(b[sortConfig.key])) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? faSortUp : faSortDown;
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
          <FontAwesomeIcon icon={faSpinner} spin />
        </div>
      ) : (
        <table className="profits-table">
          <thead>
            <tr>
              <th>Influencer</th>
              <th onClick={() => handleSort("avgProfit")}>
                Average Profit (%){" "}
                <FontAwesomeIcon icon={getSortIcon("avgProfit")} />
              </th>
              <th onClick={() => handleSort("coinCount")}>
                Number of Coins{" "}
                <FontAwesomeIcon icon={getSortIcon("coinCount")} />
              </th>
              <th onClick={() => handleSort("rugPullCount")}>
      Rugpull <FontAwesomeIcon icon={getSortIcon("rugPullCount")} />
    </th>
            </tr>
          </thead>
          <tbody>
            {sortedUserProfits.map((influencer, index) => (
              <tr key={index}>
                <td>
                  <Link
                    to={`/user/${influencer.influencerId}`}
                    className="user-link"
                  >
                    {influencer.influencerName}
                  </Link>
                </td>
                <td
                  className={
                    influencer.totalProfit > 0
                      ? "profit-positive"
                      : "profit-negative"
                  }
                >
                  {(influencer.totalProfit / influencer.coinCount).toFixed(2)}%
                </td>
                <td>{influencer.coinCount}</td>
                <td>{influencer.rugPullCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AverageProfits;
