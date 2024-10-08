const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');




// Kullanıcıyı silme
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id); // findByIdAndDelete kullanıyoruz
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json({ message: 'Kullanıcı silindi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Yeni kullanıcı ekleme
router.post('/', async (req, res) => {
  const user = new User({
    name: req.body.name,
    twitter: req.body.twitter,
    category: req.body.category,
    coins: req.body.coins,
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Hata:', err);
    if (err.name === 'ValidationError') {
      // Validation hatalarını detaylı olarak döndür
      const errors = Object.keys(err.errors).map((key) => ({
        field: key,
        message: err.errors[key].message,
      }));
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    res.status(400).json({ message: `Coin eklenirken hata oluştu: ${err.message}` });
  }
});

// Belirli bir kullanıcıya coin ekleme
router.post('/:id/coins', async (req, res) => {
  try {
    console.log('Gelen isteğin gövdesi:', req.body);

    // Kullanıcıyı 'findById' ile buluyoruz
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const caAddress = req.body.caAddress;
    console.log('CA adresi:', caAddress);

    // CA adresinden coin verilerini al
    const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${caAddress}`);
    console.log('DexScreener API yanıtı:', response.data);

    const pairs = response.data.pairs;
    if (!pairs || pairs.length === 0) {
      console.error('DexScreener API yanıtında coin bulunamadı.');
      return res.status(400).json({ message: 'Coin verileri alınamadı.' });
    }

    const pair = pairs[0];
    const tokenData = pair.baseToken;

    console.log('pair:', pair);

    // shareDate ve shareMarketCap'i alıyoruz
    const shareDate = new Date(req.body.shareDate);
    const shareMarketCap = req.body.shareMarketCap; // Yeni alan

    const newCoin = {
      symbol: tokenData.symbol,
      name: tokenData.name,
      caAddress: caAddress,
      shareDate: shareDate,
      sharePrice: req.body.sharePrice,
      shareMarketCap: shareMarketCap, // Paylaşım tarihindeki market cap'i ekledik
      // chainId: chainId, // chainId'yi kaldırdık
    };

    console.log('Yeni coin nesnesi:', newCoin);

    user.coins.push(newCoin);
    await user.save();

    // Yeni eklenen coin'i almak için
    const addedCoin = user.coins[user.coins.length - 1];

    res.status(201).json(addedCoin);
  } catch (err) {
    console.error('Hata:', err);
    if (err.name === 'ValidationError') {
      // Validation hatalarını detaylı olarak döndür
      const errors = Object.keys(err.errors).map((key) => ({
        field: key,
        message: err.errors[key].message,
      }));
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    res.status(400).json({ message: `Coin eklenirken hata oluştu: ${err.message}` });
  }
});

// Belirli bir kullanıcıdan coin silme
router.delete('/:userId/coins/:coinId', async (req, res) => {
  try {
    const result = await User.updateOne(
      { _id: req.params.userId },
      { $pull: { coins: { _id: req.params.coinId } } }
    );
    if (result.nModified === 0) {
      return res.status(404).json({ message: 'Coin bulunamadı' });
    }
    res.status(200).json({ message: 'Coin silindi' });
  } catch (err) {
    console.error('Hata:', err);
    res.status(400).json({ message: 'Coin silinirken hata oluştu.' });
  }
});

// Rota kullanıcıları kategoriye göre getirir
router.get('/users/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const users = await User.find({ category: category });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a user to favorites
router.put('/:id/favorite', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isFavorite: true }, 
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Belirli bir kullanıcının belirli bir coinini güncelleme
router.put('/:userId/coins/:coinId', async (req, res) => {
  try {
    const { userId, coinId } = req.params;
    const { shareDate, sharePrice, shareMarketCap } = req.body;

    // Kullanıcıyı bulun
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Coin'i bulun
    const coin = user.coins.id(coinId);
    if (!coin) {
      return res.status(404).json({ message: 'Coin bulunamadı' });
    }

    // Coin'i güncelle
    coin.shareDate = shareDate;
    coin.sharePrice = sharePrice;
    coin.shareMarketCap = shareMarketCap;

    // Değişiklikleri kaydet
    await user.save();

    res.json(coin);
  } catch (err) {
    console.error('Hata:', err);
    res.status(400).json({ message: 'Coin güncellenirken hata oluştu.' });
  }
});

// Remove a user from favorites
router.delete('/:id/favorite', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isFavorite: false }, 
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bir coin'i favorileme
router.put('/:userId/coins/:coinId/favorite', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const coin = user.coins.id(req.params.coinId);
    if (!coin) {
      return res.status(404).json({ message: 'Coin bulunamadı' });
    }
    coin.isFavorite = true;
    await user.save();
    res.json(coin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bir coin'i favoriden çıkarma
router.delete('/:userId/coins/:coinId/favorite', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const coin = user.coins.id(req.params.coinId);
    if (!coin) {
      return res.status(404).json({ message: 'Coin bulunamadı' });
    }
    coin.isFavorite = false;
    await user.save();
    res.json(coin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Tüm kullanıcılardan favori coinleri alma
router.get('/coins/favorites', async (req, res) => {
  try {
    const favoriteCoins = await User.aggregate([
      { $unwind: '$coins' },
      { $match: { 'coins.isFavorite': true } },
      {
        $project: {
          _id: 0,
          userName: '$name',
          userTwitter: '$twitter',
          userId: '$_id',
          coin: '$coins',
        },
      },
    ]);

    res.json(favoriteCoins);
  } catch (err) {
    console.error('Favori coinler getirilirken hata oluştu:', err);
    res.status(500).json({ message: 'Favori coinler getirilirken hata oluştu' });
  }
});

// Get highlights data
router.get('/highlights', async (req, res) => {
  try {
    const users = await User.find();

    let highestAvgProfitUser = null;
    let highestAvgProfit = -Infinity;

    let highestProfitCoin = null;
    let highestProfit = -Infinity;

    let mostCoinsUser = null;
    let mostCoinsCount = -1;

    // Collect all coins with user info
    const coinList = [];

    for (const user of users) {
      const coins = user.coins;

      if (coins.length > mostCoinsCount) {
        mostCoinsCount = coins.length;
        mostCoinsUser = user;
      }

      for (const coin of coins) {
        coinList.push({
          coin: coin,
          user: user,
        });
      }
    }

    // Fetch current market data for all coins in parallel
    const coinMarketCapCache = {};
    const coinPromises = coinList.map(async (item) => {
      const coin = item.coin;
      const user = item.user;
      const caAddress = coin.caAddress;

      if (!coinMarketCapCache[caAddress]) {
        try {
          const response = await axios.get(
            `https://api.dexscreener.com/latest/dex/tokens/${caAddress}`
          );

          const pairs = response.data.pairs;
          if (pairs && pairs.length > 0) {
            const pair = pairs[0];
            const currentMarketCap = pair.marketCap;

            coinMarketCapCache[caAddress] = currentMarketCap;
          } else {
            console.error(`No pairs found for CA: ${caAddress}`);
            coinMarketCapCache[caAddress] = null;
          }
        } catch (err) {
          console.error(`Error fetching data for CA: ${caAddress}`, err);
          coinMarketCapCache[caAddress] = null;
        }
      }

      const currentMarketCap = coinMarketCapCache[caAddress];
      const shareMarketCap = coin.shareMarketCap;

      if (!currentMarketCap || !shareMarketCap) {
        return null;
      }

      const profitPercentage = ((currentMarketCap - shareMarketCap) / shareMarketCap) * 100;
      return {
        coin,
        user,
        profitPercentage,
      };
    });

    const coinResults = await Promise.all(coinPromises);

    // Process the results
    const userProfits = {}; // key: userId, value: { totalProfit, coinCount }

    for (const result of coinResults) {
      if (!result) continue;

      const { coin, user, profitPercentage } = result;

      // Update user profits
      if (!userProfits[user._id]) {
        userProfits[user._id] = {
          user: user,
          totalProfit: 0,
          coinCount: 0,
        };
      }

      userProfits[user._id].totalProfit += profitPercentage;
      userProfits[user._id].coinCount += 1;

      // Update highest profit coin
      if (profitPercentage > highestProfit) {
        highestProfit = profitPercentage;
        highestProfitCoin = {
          ...coin.toObject(),
          profitPercentage,
          userName: user.name,
          userId: user._id,
        };
      }
    }

    // Find the user with highest average profit
    for (const userId in userProfits) {
      const { user, totalProfit, coinCount } = userProfits[userId];
      const avgProfit = totalProfit / coinCount;

      if (avgProfit > highestAvgProfit) {
        highestAvgProfit = avgProfit;
        highestAvgProfitUser = {
          ...user.toObject(),
          avgProfit,
        };
      }
    }

    res.json({
      highestAvgProfitUser,
      highestProfitCoin,
      mostCoinsUser,
    });
  } catch (err) {
    console.error('Error fetching highlights data:', err);
    res.status(500).json({ message: 'Error fetching highlights data' });
  }
});

// Tüm kullanıcıların ortalama kâr/zararını getirme
router.get('/average-profits', async (req, res) => {
  try {
    const users = await User.find();

    const userProfitData = [];

    // Tüm kullanıcılar için kâr/zarar hesaplama
    for (const user of users) {
      const coins = user.coins;

      if (coins.length === 0) {
        // Kullanıcının coini yoksa atla
        continue;
      }

      let totalProfit = 0;
      let validCoinCount = 0;

      for (const coin of coins) {
        const caAddress = coin.caAddress;

        try {
          const response = await axios.get(
            `https://api.dexscreener.com/latest/dex/tokens/${caAddress}`
          );

          const pairs = response.data.pairs;
          if (pairs && pairs.length > 0) {
            const pair = pairs[0];
            const currentMarketCap = pair.marketCap;
            const shareMarketCap = coin.shareMarketCap;

            if (currentMarketCap && shareMarketCap) {
              const profitPercentage = ((currentMarketCap - shareMarketCap) / shareMarketCap) * 100;
              totalProfit += profitPercentage;
              validCoinCount += 1;
            }
          }
        } catch (err) {
          console.error(`CA adresi için veri alınırken hata oluştu (${caAddress}):`, err);
          // Hata varsa bu coini atla
          continue;
        }
      }

      if (validCoinCount > 0) {
        const avgProfit = totalProfit / validCoinCount;
        userProfitData.push({
          userId: user._id,
          userName: user.name,
          avgProfit: avgProfit,
        });
      }
    }

    res.json(userProfitData);
  } catch (err) {
    console.error('Ortalama kârlar alınırken hata oluştu:', err);
    res.status(500).json({ message: 'Ortalama kârlar alınırken hata oluştu' });
  }
});

// Tüm kullanıcıları alma veya favorilere göre filtreleme
router.get('/', async (req, res) => {
  try {
    const { favorite } = req.query;
    let users;
    if (favorite === 'true') {
      users = await User.find({ isFavorite: true });
    } else {
      users = await User.find();
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Belirli bir kullanıcıyı alma
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // findById kullanıyoruz
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
