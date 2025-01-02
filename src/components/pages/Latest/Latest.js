// src/components/pages/Latest/Latest.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

// Material UI bileşenleri
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Divider,
} from "@mui/material";

/* =========================================
   Fiyat formatlama fonksiyonu (JSX döndürüyor)
   ========================================= */
const formatPriceWithConditionalZeros = (rawPrice) => {
  if (rawPrice === null || rawPrice === undefined) {
    return "Loading";
  }
  const price = Number(rawPrice);
  if (Number.isNaN(price)) {
    return "Loading";
  }
  if (price === 0) {
    return <span>$0</span>;
  }

  let priceString = price.toString();

  // Bilimsel notasyon varsa
  if (priceString.includes("e")) {
    priceString = price.toFixed(20).replace(/\.?0+$/, "");
  }

  let [integer, decimal] = priceString.split(".");

  // Ondalık kısım yoksa doğrudan döndür
  if (!decimal) {
    return <span>${integer}</span>;
  }

  // Ondalık kısımda kaç sıfır var?
  const leadingZerosMatch = decimal.match(/^0+/);
  const zerosCount = leadingZerosMatch ? leadingZerosMatch[0].length : 0;

  // 4 veya daha fazla sıfır varsa
  if (zerosCount >= 4) {
    const remainingDecimals = decimal.slice(zerosCount, zerosCount + 3);
    return (
      <span>
        ${integer}.0<sub>{zerosCount}</sub>
        {remainingDecimals}
      </span>
    );
  } else {
    // integer 0 ise (örneğin 0.0012)
    if (integer === "0") {
      // 3 basamak gösterelim
      const decimalsToShow = decimal.slice(0, zerosCount + 3);
      return (
        <span>
          ${integer}.{decimalsToShow}
        </span>
      );
    } else {
      // integer > 0 ise 2 basamak
      const limitedDecimals = decimal.slice(0, 2);
      return (
        <span>
          ${integer}.{limitedDecimals}
        </span>
      );
    }
  }
};

/* =========================================
   Asıl Latest Bileşeni
   ========================================= */
const API_URL = "http://localhost:5000";

const Latest = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.user);

  // Axios interceptor
  useEffect(() => {
    const axiosInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    return () => {
      axios.interceptors.request.eject(axiosInterceptor);
    };
  }, [token]);

  // Backend’den verileri çek
  useEffect(() => {
    const fetchLatestCoins = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/appUser/admin-influencers/latest-coins`
        );
        console.log("Backend Response:", response.data);

        // Tarih sıralamasına ek olarak _id tie-breaker
        const sortedCoins = [...response.data].sort((a, b) => {
          const dateDiff = new Date(b.shareDate) - new Date(a.shareDate);
          if (dateDiff !== 0) {
            return dateDiff;
          } else {
            // Aynı shareDate -> _id'si büyük olan (yani en son eklenmiş) üstte
            return b._id.localeCompare(a._id);
          }
        });

        setCoins(sortedCoins);
      } catch (err) {
        console.error("Error fetching latest coins:", err);
        setError("Error fetching latest coins. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCoins();
  }, []);

  // Yüklenme durumu
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  // Kâr/zar formatlama (string döndürüyor)
  const formatProfitPercentage = (profit) =>
    profit !== undefined ? `${profit.toFixed(2)}%` : "N/A";

  return (
    <Box maxWidth="lg" mx="auto" p={3}>
    {/* Başlık ve Tablo Çerçevesi */}
    <Paper elevation={4} sx={{ p: 3, mb: 3 }}>
      {/* Sayfa Başlığı */}
      <Box textAlign="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Latest Coins
        </Typography>
      </Box>
      <Divider />
      {/* Tablo Konteyneri */}
      <Paper elevation={3} sx={{ overflowX: "auto", mt:"1rem" }}>
        <TableContainer>
          <Table>
            {/* Tablo Başlıkları */}
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Coin Adı
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Paylaşan Kişi
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>
                  Paylaştığı Fiyat
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>
                  Şu Anki Fiyat
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>
                  Kâr/Zarar (%)
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Paylaştığı Tarih
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Tablo Gövdesi */}
            <TableBody>
              {coins.map((coin, index) => (
                <TableRow
                  key={coin._id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#fafafa" : "inherit",
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  <TableCell sx={{ textAlign: "center" }}>
                    {coin.url ? (
                      <a
                        href={coin.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "#1976d2" }}
                      >
                        {coin.name} {coin.symbol ? `(${coin.symbol})` : ""}
                      </a>
                    ) : (
                      <>
                        <span style={{ color: "red" }}>URL Eksik</span>{" "}
                        {coin.name} {coin.symbol ? `(${coin.symbol})` : ""}
                      </>
                    )}
                  </TableCell>

                  <TableCell sx={{ textAlign: "center" }}>
                    <Link
                      to={`/user/${coin.influencerId}`}
                      style={{ textDecoration: "none", color: "#1976d2" }}
                    >
                      {coin.influencerName}
                    </Link>
                  </TableCell>

                  <TableCell sx={{ textAlign: "right" }}>
                    {coin.sharePrice
                      ? formatPriceWithConditionalZeros(coin.sharePrice)
                      : "N/A"}
                  </TableCell>

                  <TableCell sx={{ textAlign: "right" }}>
                    {coin.currentPrice
                      ? formatPriceWithConditionalZeros(coin.currentPrice)
                      : "N/A"}
                  </TableCell>

                  <TableCell
                    sx={{
                      textAlign: "right",
                      color:
                        coin.profitPercentage > 0
                          ? "green"
                          : coin.profitPercentage < 0
                          ? "red"
                          : "inherit",
                    }}
                  >
                    {coin.profitPercentage
                      ? formatProfitPercentage(coin.profitPercentage)
                      : "N/A"}
                  </TableCell>

                  <TableCell sx={{ textAlign: "center" }}>
                    {new Date(coin.shareDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      </Paper>
    </Box>
  );
};

export default Latest;
