const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const coinSchema = new mongoose.Schema({
  symbol: String,
  name: String,
  caAddress: String,
  shareDate: Date,
  sharePrice: Number,
  shareMarketCap: Number,
  isFavorite: { type: Boolean, default: false },
});

const influencerSchema = new mongoose.Schema({
  name: String,
  twitter: String,
  coins: [coinSchema], // Artık coinSchema kullanılıyor
  isFavorite: { type: Boolean, default: false }, 
});

const appUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Benzersiz kullanıcı adı
  password: { type: String, required: true }, // Şifre (hashlenmiş)
  role: { type: String, default: 'appUser' }, // Rol (örneğin 'appUser' ya da 'admin')
  isActive: { type: Boolean, default: true }, // Kullanıcı aktif mi?
  createdAt: { type: Date, default: Date.now }, // Kullanıcının oluşturulma tarihi
  influencers: [influencerSchema], // Influencers alanı ekleniyor
  pushSubscription: mongoose.Schema.Types.Mixed,
});



// Şifreyi hashleyerek kaydetme
appUserSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Şifreyi doğrulama metodu
appUserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('AppUser', appUserSchema);
