// backend/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// Frontend build dosyalarını serve etme
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}


// Middleware'ler
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// MongoDB'ye Bağlanma
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
  })
  .catch((error) => {
    console.error('MongoDB bağlantı hatası:', error);
  });

// API Rotaları
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

// Sunucuyu Başlatma
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} üzerinde çalışıyor`);
});

