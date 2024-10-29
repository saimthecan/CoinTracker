const express = require('express');
const router = express.Router();
const AppUser = require('../models/AppUser'); // AppUser modelini kullanıyoruz
const jwt = require('jsonwebtoken');

// Kullanıcı kayıt olma
router.post('/signup', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      
      // Kullanıcı zaten var mı kontrol et
      const existingUser = await AppUser.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists!' });
      }
  
      // Yeni AppUser oluştur ve kaydet
      const newUser = new AppUser({
        username,
        password, // Şifre AppUser schema'sındaki pre-save middleware ile hashlenecek
      });
  
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Registration failed', error: err.message });
    }
  });
  

// Kullanıcı giriş yapma
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcıyı bul
    const user = await AppUser.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Şifreyi doğrula
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // JWT oluştur ve token döndür
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({ token, username: user.username, userId: user._id, role: user.role });
    
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Bu middleware'i kullanıcı işlemlerine ekleyin
router.get('/some-secured-route', authenticateToken, (req, res) => {
  // Artık kullanıcı doğrulandı, işlem yapabilirsiniz
});

module.exports = router;
