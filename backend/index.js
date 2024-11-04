// backend/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// Middleware'ler
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


// Ana sayfa rotası
app.get('/', (req, res) => {
  res.send('Ana sayfa - Coin Tracker API çalışıyor.');
});

// MongoDB'ye Bağlanma
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
  })
  .catch((error) => {
    console.error('MongoDB bağlantı hatası:', error);
  });


// API Rotaları
const authRouter = require('./routes/auth'); // auth ile ilgili rotalar
app.use('/auth', authRouter); // auth işlemleri için


// appUser Rotaları
const appUser = require('./routes/appUser'); // auth ile ilgili rotalar
app.use('/appUser', appUser); // auth işlemleri için

// news
const newsRouter = require('./routes/news');
app.use('/news', newsRouter);

app.get('/appUser/vapidPublicKey', (req, res) => {
  res.send(process.env.VAPID_PUBLIC_KEY);
});



// Sunucuyu Başlatma
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} üzerinde çalışıyor`);
});

