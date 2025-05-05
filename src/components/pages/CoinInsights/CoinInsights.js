import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  TextField,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from "@mui/material";
import axios from "axios";
import { formatPriceWithConditionalZeros } from "./FormatPrice"; // Dilersen aynı format fonksiyonunu burada da kullan

const API_URL = "https://cointracker-evt3.onrender.com";

const CoinInsights = () => {
  const [coinsList, setCoinsList] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // İlk yüklemede coin listesini çek
  useEffect(() => {
    const fetchGroupedCoins = async () => {
      try {
        const res = await axios.get(`${API_URL}/appUser/grouped-coins`);
        setCoinsList(res.data);
      } catch (err) {
        console.error("Coin listesi alınamadı:", err);
      }
    };
    fetchGroupedCoins();
  }, []);

  // Seçili coinin bilgileri
  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Influencer Coin Insights
      </Typography>

      <Autocomplete
        options={coinsList}
        getOptionLabel={(option) => `${option.name} (${option.symbol})`}
        onChange={(event, value) => handleCoinSelect(value)}
        renderInput={(params) => (
          <TextField {...params} label="Coin seçiniz" variant="outlined" />
        )}
        sx={{ width: "100%", maxWidth: 400, mb: 3 }}
      />

      <Divider />

      {selectedCoin ? (
        <Paper sx={{ mt: 3, p: 2 }} elevation={4}>
          <Box display="flex" alignItems="center" mb={2}>
            <a
              href={selectedCoin.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: "1rem" }}
            >
              <img
                src={selectedCoin.imageUrl}
                alt={selectedCoin.name}
                width={50}
                height={50}
                style={{ cursor: "pointer", borderRadius: "5px" }}
              />
            </a>
            <Box>
              <Typography variant="h6">
                {selectedCoin.name} ({selectedCoin.symbol})
              </Typography>
              <Typography variant="body2">
                Ağ: {selectedCoin.network} — Fiyat: ${selectedCoin.currentPrice}{" "}
                — MCAP: ${selectedCoin.currentMarketCap.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>Influencer</TableCell>
                  <TableCell>Twitter</TableCell>
                  <TableCell align="right">Paylaşılan Fiyat</TableCell>
                  <TableCell align="right">Şu Anki Fiyat</TableCell>
                  <TableCell align="right">MCAP Değişimi (%)</TableCell>
                  <TableCell align="center">Paylaşım Tarihi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedCoin.sharedBy.map((sharer, i) => (
                  <TableRow key={i}>
                    <TableCell>{sharer.influencerName}</TableCell>
                    <TableCell>
                      {sharer.twitter ? (
                        <a
                          href={sharer.twitter}
                          target="_blank"
                          rel="noreferrer"
                        >
                          @{sharer.twitter.split("/").pop()}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatPriceWithConditionalZeros(sharer.sharePrice)}
                    </TableCell>
                    <TableCell align="right">
                      {formatPriceWithConditionalZeros(
                        selectedCoin.currentPrice
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{
                        color: sharer.marketCapComparison > 0 ? "green" : "red",
                      }}
                    >
                      {sharer.marketCapComparison !== null
                        ? `${sharer.marketCapComparison.toFixed(2)}%`
                        : "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(sharer.shareDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Typography variant="body1" mt={3}>
          Lütfen yukarıdan bir coin seçiniz.
        </Typography>
      )}
    </Box>
  );
};

export default CoinInsights;
