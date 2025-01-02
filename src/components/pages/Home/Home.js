import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
} from "@mui/material";
import HomeImage from "../../../assets/home.png";
import UserIcon from "../../../assets/user.svg";
import NewsIcon from "../../../assets/news.png";
import CryptoTicker from "./CryptoTicker";

const Home = () => {
  const [highlights, setHighlights] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchHighlights = async () => {
      setLoading(true);
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = storedUser ? storedUser.token : null;
        const appUserId = user.userId;

        const url = `https://cointracker-backend-7786c0daa55a.herokuapp.com/appUser/${appUserId}/influencers/highlights`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHighlights(response.data);
      } catch (error) {
        console.error("Error fetching highlights:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHighlights();
  }, [user.userId]);

  return (
    <Box>
      {/* Crypto Ticker */}
      <Box my={3}>
        <CryptoTicker />
      </Box>

      {/* Hero Section */}
      <Box
        my={5}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        bgcolor="#000000"
        color="#ffffff"
        py={4}
        width="100%"
      >
        <Box
          maxWidth="lg"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
        >
          <Box flex="1" textAlign={{ xs: "center", md: "left" }}>
            <Typography variant="h4" color="white" gutterBottom>
              Step into the Gem Market!
            </Typography>
            <Typography
              sx={{ fontSize: "14px", color: "#777777", marginBottom: "1rem" }}
              gutterBottom
            >
              Discover the world of gem coins, where high volatility meets high
              risk, but with the potential for incredible gains. These
              under-the-radar cryptocurrencies, often promoted by trusted
              Twitter influencers, can see explosive growth in short periods. By
              tracking their performance and understanding their market
              movements, you can capitalize on the most promising opportunities.
            </Typography>
            {!user && ( // Kullanıcı giriş yapmamışsa butonu göster
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontSize: "12px", // Yazı boyutu
                  padding: "6px 15px", // İç boşluk (üst-alt ve sağ-sol)
                  minWidth: "80px", // Minimum genişlik
                }}
              >
                Get Started
              </Button>
            )}
          </Box>
          <Box flex="1" textAlign="center">
            <img
              src={HomeImage}
              alt="Coin Tracker"
              style={{ borderRadius: "8px", width: "70%" }}
            />
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box my={5} bgcolor="#262626" color="#ffffff" py={4} width="100%">
        <Box maxWidth="lg" mx="auto">
          <Typography variant="h4" align="center" gutterBottom>
            Features
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  alt="Favorite Influencers"
                  height="140"
                  image={UserIcon}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    Add Your Favorite Influencers
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Track trusted Twitter influencers and the coins they share.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  alt="Stay Updated"
                  height="140"
                  image={NewsIcon}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    Stay Updated
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Follow the most recent developments in the crypto world.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Highlights Section */}
      {user && (
        <Box my={5} bgcolor="#000000" color="#ffffff" py={4} width="100%">
          <Box maxWidth="lg" mx="auto">
            <Typography variant="h4" align="center" gutterBottom>
              Highlights
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress />
              </Box>
            ) : highlights ? (
              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography gutterBottom variant="h6">
                        Influencer with Highest Average Profit
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Name:{" "}
                        <Link
                          to={`/user/${highlights.highestAvgProfitUser._id}`}
                        >
                          {highlights.highestAvgProfitUser.name}
                        </Link>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Average Profit:{" "}
                        {highlights.highestAvgProfitUser.avgProfit.toFixed(2)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography gutterBottom variant="h6">
                        Top Performing Coin
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Coin: {highlights.highestProfitCoin.name} (
                        {highlights.highestProfitCoin.symbol})
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Profit:{" "}
                        {highlights.highestProfitCoin.profitPercentage.toFixed(
                          2
                        )}
                        %
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography gutterBottom variant="h6">
                        Influencer with Most Coins
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Name:{" "}
                        <Link
                          to={`/user/${highlights.mostCoinsInfluencer._id}`}
                        >
                          {highlights.mostCoinsInfluencer.name}
                        </Link>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Coins: {highlights.mostCoinsInfluencer.coinCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
              >
                <Typography variant="body1" color="textSecondary">
                  Please log in to view personalized highlights and insights.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Home;
