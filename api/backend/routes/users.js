const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');

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








module.exports = router;
