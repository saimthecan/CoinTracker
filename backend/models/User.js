// models/User.js
const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  caAddress: { type: String, required: true },
  shareDate: { type: Date, required: true },
  sharePrice: { type: Number, required: true },
  shareMarketCap: { type: Number, required: true },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  twitter: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['en_güvendiklerim', 'güvendiklerim', 'nötr'], 
    required: true 
  },
  isFavorite: { type: Boolean, default: false }, // New field
  coins: [coinSchema],
});

module.exports = mongoose.model('User', userSchema);
