const express = require("express");
const router = express.Router();
const AppUser = require("../models/AppUser");
const axios = require("axios");
const authenticateToken = require("../middleware/authenticateToken"); // Import here
const mongoose = require("mongoose");
const webpush = require("web-push");
const { sendEmail } = require("../services/emailService");

// Ana sayfa rotası
router.get("/", (req, res) => {
  res.send("Ana sayfa - Coin Tracker API çalışıyor.");
});

// Admin influencer ekleme
router.post("/admin-influencers", authenticateToken, async (req, res) => {
  try {
    // Kullanıcının admin olup olmadığını kontrol edin
    const appUser = await AppUser.findById(req.user.id);
    if (!appUser || appUser.role !== "admin") {
      return res.status(403).json({ message: "Bu işlemi yapma yetkiniz yok" });
    }

    // Yeni influencer'ı admin kullanıcının 'influencers' alanına ekle
    const newInfluencer = {
      name: req.body.name,
      twitter: req.body.twitter,
      coins: req.body.coins || [],
      isFavorite: false,
    };

    appUser.influencers.push(newInfluencer);
    await appUser.save();

    // Fetch all users who have an email subscription
    const subscribedUsers = await AppUser.find({
      email: { $exists: true, $ne: null },
    });

    // Send an email to each subscribed user
    const emailPromises = subscribedUsers.map((user) => {
      const subject = "New Influencer Added";
      const message = `${newInfluencer.name} has been added as a new influencer.`;
      const htmlContent = `
      <p>A new influencer named ${newInfluencer.name} has been added.</p>
      <p><a href="https://cointracker-canozgen.netlify.app/admin-influencers">Go to App</a></p>
    `;
      return sendEmail(user.email, subject, message, htmlContent);
    });

    await Promise.all(emailPromises);

    res.status(201).json(newInfluencer);
  } catch (err) {
    console.error("Admin influencer eklerken hata oluştu:", err);
    res
      .status(500)
      .json({ message: `Influencer eklenirken hata oluştu: ${err.message}` });
  }
});

// Admin influencer silme
router.delete(
  "/admin-influencers/:influencerId",
  authenticateToken,
  async (req, res) => {
    try {
      // Kullanıcının admin olup olmadığını kontrol edin
      const appUser = await AppUser.findById(req.user.id);
      if (!appUser || appUser.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Bu işlemi yapma yetkiniz yok" });
      }

      const influencerId = req.params.influencerId;

      // Influencer'ı içeren admin kullanıcıyı bulun
      const adminUser = await AppUser.findOne({
        role: "admin",
        "influencers._id": influencerId,
      });
      if (!adminUser) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      // Influencer'ın varlığını kontrol edin
      const influencer = adminUser.influencers.id(influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      // Influencer'ı silin
      adminUser.influencers.pull(influencerId);
      await adminUser.save();

      res.status(200).json({ message: "Influencer silindi" });
    } catch (err) {
      console.error("Admin influencer silinirken hata oluştu:", err);
      res.status(500).json({ message: "Influencer silinirken hata oluştu." });
    }
  }
);

// Belirli bir admin influencer'a coin ekleme
router.post(
  "/admin-influencers/:influencerId/coins",
  authenticateToken,
  async (req, res) => {
    try {
      // Kullanıcının admin olup olmadığını kontrol edin
      const appUser = await AppUser.findById(req.user.id);
      if (!appUser || appUser.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Bu işlemi yapma yetkiniz yok" });
      }

      const influencerId = req.params.influencerId;

      // Influencer'ı içeren admin kullanıcıyı bulun
      const adminUser = await AppUser.findOne({
        role: "admin",
        "influencers._id": influencerId,
      });
      if (!adminUser) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const influencer = adminUser.influencers.id(influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const caAddress = req.body.caAddress;

      // CA adresinden coin verilerini al
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${caAddress}`
      );
      const pairs = response.data.pairs;
      if (!pairs || pairs.length === 0) {
        console.error("DexScreener API yanıtında coin bulunamadı.");
        return res.status(400).json({ message: "Coin verileri alınamadı." });
      }

      const pair = pairs[0];
      const tokenData = pair.baseToken;

      // DexScreener URL'sini alın
      const dexScreenerUrl = pair.url; 

      // shareDate ve shareMarketCap'i alıyoruz
      const shareDate = new Date(req.body.shareDate);
      const shareMarketCap = req.body.shareMarketCap;

      const newCoin = {
        symbol: tokenData.symbol,
        name: tokenData.name,
        caAddress: caAddress,
        shareDate: shareDate,
        sharePrice: req.body.sharePrice,
        shareMarketCap: shareMarketCap,
      };

      influencer.coins.push(newCoin);
      await adminUser.save();

      // Yeni eklenen coin'i almak için
      const addedCoin = influencer.coins[influencer.coins.length - 1];

      // *** Burada email bildirimlerini gönderiyoruz ***
      // Email aboneliği olan kullanıcıları bulun
      const subscribedUsers = await AppUser.find({
        email: { $exists: true, $ne: null },
      });

      // Her kullanıcıya email gönderin
      const emailPromises = subscribedUsers.map((user) => {
        const subject = "New Coin Added";
        // Mesaj ve HTML içeriği
        const message =
          `A new coin has been added to the influencer named ${influencer.name}: ${addedCoin.name} (${addedCoin.symbol}).\n` +
          `Posted Price: ${addedCoin.sharePrice}\n` +
          `Posted MarketCap: ${addedCoin.shareMarketCap}\n` +
          `DexScreener Link: ${dexScreenerUrl}`;

        const htmlContent = `
          <p>A new coin has been added to the influencer named ${influencer.name}: <strong>${addedCoin.name} (${addedCoin.symbol})</strong>.</p>
          <p>Posted Price: ${addedCoin.sharePrice}</p>
          <p>Posted MarketCap: ${addedCoin.shareMarketCap}</p>
          <p><a href="${dexScreenerUrl}">DexScreener Link</a></p>
`;
        return sendEmail(user.email, subject, message, htmlContent);
      });

      await Promise.all(emailPromises);

      res.status(201).json(addedCoin);
    } catch (err) {
      console.error("Hata:", err);
      res
        .status(400)
        .json({ message: `Coin eklenirken hata oluştu: ${err.message}` });
    }
  }
);

// Belirli bir admin influencer'ın coinini güncelleme
router.put(
  "/admin-influencers/:influencerId/coins/:coinId",
  authenticateToken,
  async (req, res) => {
    try {
      // Kullanıcının admin olup olmadığını kontrol edin
      const appUser = await AppUser.findById(req.user.id);
      if (!appUser || appUser.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Bu işlemi yapma yetkiniz yok" });
      }

      const influencerId = req.params.influencerId;
      const coinId = req.params.coinId;

      // Influencer'ı içeren admin kullanıcıyı bulun
      const adminUser = await AppUser.findOne({
        role: "admin",
        "influencers._id": influencerId,
      });
      if (!adminUser) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const influencer = adminUser.influencers.id(influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const coin = influencer.coins.id(coinId);
      if (!coin) {
        return res.status(404).json({ message: "Coin bulunamadı" });
      }

      coin.shareDate = req.body.shareDate || coin.shareDate;
      coin.sharePrice = req.body.sharePrice || coin.sharePrice;
      coin.shareMarketCap = req.body.shareMarketCap || coin.shareMarketCap;

      await adminUser.save();
      res.json(coin);
    } catch (err) {
      console.error("Coin güncellenirken hata oluştu:", err);
      res.status(500).json({ message: "Coin güncellenirken hata oluştu" });
    }
  }
);

// Belirli bir admin influencer'ın coinini silme
router.delete(
  "/admin-influencers/:influencerId/coins/:coinId",
  authenticateToken,
  async (req, res) => {
    try {
      // Kullanıcının admin olup olmadığını kontrol edin
      const appUser = await AppUser.findById(req.user.id);
      if (!appUser || appUser.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Bu işlemi yapma yetkiniz yok" });
      }

      const influencerId = req.params.influencerId;
      const coinId = req.params.coinId;

      // Influencer'ı içeren admin kullanıcıyı bulun
      const adminUser = await AppUser.findOne({
        role: "admin",
        "influencers._id": influencerId,
      });
      if (!adminUser) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const influencer = adminUser.influencers.id(influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const coin = influencer.coins.id(coinId);
      if (!coin) {
        return res.status(404).json({ message: "Coin bulunamadı" });
      }

      influencer.coins.pull(coinId);

      await adminUser.save();

      res.status(200).json({ message: "Coin silindi" });
    } catch (err) {
      console.error("Coin silinirken hata oluştu:", err);
      res.status(500).json({ message: "Coin silinirken hata oluştu" });
    }
  }
);

// Admin influencer'ını favorilere ekleme
router.put(
  "/admin-influencers/:influencerId/favorite",
  authenticateToken,
  async (req, res) => {
    try {
      const influencerId = req.params.influencerId;
      const appUser = await AppUser.findById(req.user.id);

      if (!appUser)
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });

      const influencer = appUser.influencers.id(influencerId);
      influencer.isFavorite = true;
      await appUser.save();

      res.json({ message: "Influencer favorilere eklendi" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Admin influencer'ın favoriden çıkarma
router.delete(
  "/admin-influencers/:influencerId/favorite",
  authenticateToken,
  async (req, res) => {
    try {
      const influencerId = req.params.influencerId;
      const appUser = await AppUser.findById(req.user.id);

      if (!appUser)
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });

      const influencer = appUser.influencers.id(influencerId);
      influencer.isFavorite = false;
      await appUser.save();

      res.json({ message: "Influencer favorilerden çıkarıldı" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Belirli bir coin'i favori yapma (admin veya kullanıcı)
router.put(
  "/admin-influencers/:influencerId/coins/:coinId/favorite",
  authenticateToken,
  async (req, res) => {
    try {
      const { influencerId, coinId } = req.params;
      const appUser = await AppUser.findById(req.user.id);
      if (!appUser)
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });

      const influencer = appUser.influencers.id(influencerId);
      if (!influencer)
        return res.status(404).json({ message: "Influencer bulunamadı" });

      const coin = influencer.coins.id(coinId);
      if (!coin) return res.status(404).json({ message: "Coin bulunamadı" });

      coin.isFavorite = true; // Favori yapılıyor
      await appUser.save();

      res.json({ message: "Coin favorilere eklendi", coin });
    } catch (err) {
      console.error("Favori eklenirken hata oluştu:", err);
      res.status(500).json({ message: "Favori eklenirken hata oluştu" });
    }
  }
);

// Favori coinlerden çıkarma
router.delete(
  "/admin-influencers/:influencerId/coins/:coinId/favorite",
  authenticateToken,
  async (req, res) => {
    try {
      const { influencerId, coinId } = req.params;
      const appUser = await AppUser.findById(req.user.id);

      if (!appUser)
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });

      const influencer = appUser.influencers.id(influencerId);
      if (!influencer)
        return res.status(404).json({ message: "Influencer bulunamadı" });

      const coin = influencer.coins.id(coinId);
      if (!coin) return res.status(404).json({ message: "Coin bulunamadı" });

      // Favori durumunu kaldırıyoruz
      coin.isFavorite = false;
      await appUser.save();

      res.json({ message: "Coin favorilerden çıkarıldı", coin });
    } catch (err) {
      console.error("Favori çıkarılırken hata oluştu:", err);
      res.status(500).json({ message: "Favori çıkarılırken hata oluştu" });
    }
  }
);

// Yalnızca admin influencerlarının coinlerini getirme
router.get(
  "/admin-influencers/:influencerId/coins",
  authenticateToken,
  async (req, res) => {
    try {
      const influencerId = req.params.influencerId;
      const adminUser = await AppUser.findOne({
        role: "admin",
        "influencers._id": influencerId,
      });

      if (!adminUser) {
        return res.status(404).json({ message: "Admin influencer bulunamadı" });
      }

      const influencer = adminUser.influencers.id(influencerId);
      res.json(influencer.coins); // Influencer'ın coinlerini döndürüyoruz
    } catch (err) {
      console.error("Influencerın coinleri getirilirken hata oluştu:", err);
      res
        .status(500)
        .json({ message: "Influencerın coinleri alınırken hata oluştu" });
    }
  }
);

// Admin influencer'ın detaylarını getirme
router.get(
  "/admin-influencers/:influencerId",
  authenticateToken,
  async (req, res) => {
    try {
      const influencerId = req.params.influencerId;

      // Admin kullanıcıyı ve belirtilen influencer'ı bulun
      const adminUser = await AppUser.findOne({
        role: "admin",
        "influencers._id": influencerId,
      });

      if (!adminUser) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const influencer = adminUser.influencers.id(influencerId);

      res.json(influencer);
    } catch (err) {
      console.error("Influencer getirilirken hata oluştu:", err);
      res.status(500).json({ message: "Influencer alınırken hata oluştu" });
    }
  }
);

// Admin'in fenomenlerinin kar/zarar ortalamasını hesaplama
router.get("/admin-influencers/average-profits", async (req, res) => {
  try {
    const appUser = await AppUser.findOne({ role: "admin" }); // Sadece admin rolündeki kullanıcıyı seçiyoruz

    if (!appUser) {
      return res.status(404).json({ message: "Admin kullanıcı bulunamadı." });
    }

    let totalProfit = 0;
    let validCoinCount = 0;
    const coinMarketCapCache = {};

    // Admin kullanıcının influencer listesindeki coinler üzerinden kar/zarar hesaplaması
    const coinPromises = appUser.influencers.map(async (influencer) => {
      return influencer.coins.map(async (coin) => {
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
              coinMarketCapCache[caAddress] = null;
            }
          } catch (err) {
            console.error(`DexScreener API isteğinde hata: ${err.message}`);
            coinMarketCapCache[caAddress] = null;
          }
        }

        const currentMarketCap = coinMarketCapCache[caAddress];
        const shareMarketCap = coin.shareMarketCap;

        if (!currentMarketCap || !shareMarketCap) {
          return null;
        }

        const profitPercentage =
          ((currentMarketCap - shareMarketCap) / shareMarketCap) * 100;
        totalProfit += profitPercentage;
        validCoinCount += 1;
        return profitPercentage;
      });
    });

    await Promise.all(coinPromises.flat());

    if (validCoinCount > 0) {
      const averageProfit = totalProfit / validCoinCount;
      res.json({ averageProfit });
    } else {
      res.status(404).json({ message: "Hiç geçerli coin bulunamadı." });
    }
  } catch (err) {
    console.error("Admin kar/zarar ortalaması alınırken hata oluştu:", err);
    res
      .status(500)
      .json({ message: "Kar/zarar ortalaması alınırken hata oluştu." });
  }
});

// Admin'in öne çıkan fenomen ve coin bilgilerini getir
router.get("/admin-influencers/highlights", async (req, res) => {
  try {
    const appUser = await AppUser.findOne({ role: "admin" });

    // Eğer adminId 'ObjectId' türünde bir değer bekliyorsa, doğrulama yap
    if (!mongoose.Types.ObjectId.isValid(appUser._id)) {
      return res.status(400).json({ message: "Geçersiz admin ID" });
    }

    if (!appUser) {
      return res.status(404).json({ message: "Admin kullanıcı bulunamadı." });
    }

    let highestProfitCoin = null;
    let highestProfit = -Infinity;
    let mostCoinsInfluencer = null;
    let mostCoinsCount = -1;
    let totalProfit = 0;
    let validCoinCount = 0;

    const coinMarketCapCache = {};
    const coinList = [];

    // Her influencer'ın coinlerini topla
    for (const influencer of appUser.influencers) {
      const coins = influencer.coins;
      if (coins.length > mostCoinsCount) {
        mostCoinsCount = coins.length;
        mostCoinsInfluencer = influencer;
      }

      for (const coin of coins) {
        coinList.push({ coin, influencer });
      }
    }

    const coinPromises = coinList.map(async (item) => {
      const { coin, influencer } = item;
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
            coinMarketCapCache[caAddress] = null;
          }
        } catch (err) {
          console.error(`DexScreener API isteğinde hata: ${err.message}`);
          coinMarketCapCache[caAddress] = null;
        }
      }

      const currentMarketCap = coinMarketCapCache[caAddress];
      const shareMarketCap = coin.shareMarketCap;

      if (!currentMarketCap || !shareMarketCap) {
        return null;
      }

      const profitPercentage =
        ((currentMarketCap - shareMarketCap) / shareMarketCap) * 100;
      totalProfit += profitPercentage;
      validCoinCount += 1;

      if (profitPercentage > highestProfit) {
        highestProfit = profitPercentage;
        highestProfitCoin = {
          ...coin.toObject(),
          profitPercentage,
          influencerName: influencer.name,
        };
      }

      return profitPercentage;
    });

    await Promise.all(coinPromises);

    const averageProfit =
      validCoinCount > 0 ? totalProfit / validCoinCount : null;

    res.json({
      highestProfitCoin,
      mostCoinsUser: mostCoinsInfluencer
        ? {
            name: mostCoinsInfluencer.name,
            coinCount: mostCoinsCount,
          }
        : null,
      highestAvgProfitUser:
        appUser && averageProfit !== null
          ? {
              name: appUser.name,
              avgProfit: averageProfit,
            }
          : null,
    });
  } catch (err) {
    console.error("Admin öne çıkan veriler alınırken hata oluştu:", err);
    res
      .status(500)
      .json({ message: "Öne çıkan veriler alınırken hata oluştu." });
  }
});

// Admin'in favori coinlerini listeleme

router.get(
  "/admin-influencers/favorites",
  authenticateToken,
  async (req, res) => {
    try {
      // Admin kullanıcıyı doğrulama
      const appUser = await AppUser.findById(req.user.id);
      if (!appUser || appUser.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Bu işlemi yapma yetkiniz yok" });
      }

      // Admin kullanıcının influencer listesindeki favori coinleri toplamak
      const favoriteCoins = [];

      // Her influencer'ın favori olarak işaretlenmiş coinlerini seçiyoruz
      appUser.influencers.forEach((influencer) => {
        influencer.coins.forEach((coin) => {
          if (coin.isFavorite) {
            favoriteCoins.push({
              ...coin.toObject(),
              influencerName: influencer.name, // Influencer bilgilerini ekliyoruz
              influencerTwitter: influencer.twitter,
              influencerId: influencer._id, // Influencer ID'sini ekliyoruz
            });
          }
        });
      });

      res.json(favoriteCoins); // Admin'in favori coinlerini döndürüyoruz
    } catch (err) {
      console.error("Admin favori coinler listelenirken hata oluştu:", err);
      res
        .status(500)
        .json({ message: "Favori coinler listelenirken hata oluştu" });
    }
  }
);

// Yalnızca admin tarafından eklenmiş influencerları listeleme
router.get("/admin-influencers", authenticateToken, async (req, res) => {
  try {
    // Admin kullanıcılarını ve influencer'larını filtreleyerek alıyoruz
    const adminInfluencers = await AppUser.find(
      { role: "admin" },
      "influencers"
    )
      .populate("influencers.coins") // Coin bilgilerini de getiriyoruz
      .lean(); // Mongoose'dan salt veri nesnesi döndür

    // Her admin kullanıcının influencer listesini flatMap ile birleştiriyoruz
    const influencersList = adminInfluencers.flatMap((admin) => {
      admin.influencers.forEach((influencer) => {
        influencer.coins.forEach((coin) => {});
      });
      return admin.influencers;
    });

    res.json(influencersList);
  } catch (err) {
    console.error("Admin influencerları getirilirken hata oluştu:", err);
    res.status(500).json({ message: "Influencerlar alınırken hata oluştu" });
  }
});

// Email subscription route
router.post(
  "/:appUserId/subscribe-email",
  authenticateToken,
  async (req, res) => {
    try {
      const { email } = req.body;
      const appUserId = req.params.appUserId;

      // Validate email format (optional but recommended)
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      // Find and update the user
      const appUser = await AppUser.findByIdAndUpdate(
        appUserId,
        { email },
        { new: true }
      );

      if (!appUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "Email subscription successful" });
    } catch (err) {
      console.error("Error subscribing email:", err);
      res.status(500).json({ message: "Error subscribing email" });
    }
  }
);

// routes/appUser.js
router.post(
  "/:appUserId/unsubscribe-email",
  authenticateToken,
  async (req, res) => {
    try {
      const appUserId = req.params.appUserId;

      // Kullanıcıyı bulun ve emailini silin
      const appUser = await AppUser.findByIdAndUpdate(
        appUserId,
        { $unset: { email: 1 } },
        { new: true }
      );

      if (!appUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      res.status(200).json({ message: "Email aboneliğiniz iptal edildi" });
    } catch (err) {
      console.error("Email aboneliğinden çıkarken hata oluştu:", err);
      res
        .status(500)
        .json({ message: "Email aboneliğinden çıkarken hata oluştu" });
    }
  }
);

// routes/appUser.js
router.get("/:appUserId", authenticateToken, async (req, res) => {
  try {
    const appUserId = req.params.appUserId;

    // Kullanıcıyı bulun
    const appUser = await AppUser.findById(appUserId).select("-password");

    if (!appUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.status(200).json(appUser);
  } catch (err) {
    console.error("Kullanıcı bilgileri alınırken hata oluştu:", err);
    res
      .status(500)
      .json({ message: "Kullanıcı bilgileri alınırken hata oluştu" });
  }
});

// Kullanıcı tarafından influencer ekleme
router.post("/:appUserId/influencers", authenticateToken, async (req, res) => {
  try {
    const appUser = await AppUser.findById(req.params.appUserId);
    if (!appUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Yeni influencer'ı kullanıcının 'influencers' alanına ekle
    const newInfluencer = {
      name: req.body.name,
      twitter: req.body.twitter,
      coins: req.body.coins, // Eğer influencer'ın coin'leri varsa
    };

    appUser.influencers.push(newInfluencer);
    await appUser.save();

    res.status(201).json(newInfluencer);
  } catch (err) {
    console.error("Kullanıcı influencer eklerken hata oluştu:", err);
    res
      .status(500)
      .json({ message: `Influencer eklenirken hata oluştu: ${err.message}` });
  }
});

// Kullanıcıya özel influencerları alma
router.get("/:appUserId/influencers", authenticateToken, async (req, res) => {
  const appUserId = req.params.appUserId;

  if (!mongoose.Types.ObjectId.isValid(appUserId)) {
    return res.status(400).json({ message: "Geçersiz Kullanıcı ID" });
  }

  try {
    const appUser = await AppUser.findById(appUserId);

    if (!appUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json(appUser.influencers);
  } catch (err) {
    console.error("Influencerlar alınırken hata oluştu:", err);
    res.status(500).json({ message: "Influencerlar alınırken hata oluştu" });
  }
});

// appUser eklediği fenomeni silebilecek
// appUser eklediği fenomeni silebilecek
router.delete(
  "/:appUserId/influencer/:influencerId",
  authenticateToken,
  async (req, res) => {
    try {
      // appUser'ı bulmak için giriş yapmış kullanıcının ID'sini alıyoruz
      const appUser = await AppUser.findById(req.params.appUserId);

      // Kullanıcı bulunamadıysa hata mesajı döndür
      if (!appUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      // Influencer'ı diziden kaldırmak için $pull operatörünü kullanıyoruz
      const result = await AppUser.updateOne(
        { _id: req.params.appUserId },
        { $pull: { influencers: { _id: req.params.influencerId } } }
      );

      // Eğer hiçbir doküman güncellenmediyse, influencer bulunamadı demektir
      if (result.nModified === 0) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      res.status(200).json({ message: "Fenomen silindi" });
    } catch (err) {
      console.error("Fenomen silinirken hata oluştu:", err.message);
      res.status(500).json({
        message: "Fenomen silinirken hata oluştu",
        error: err.message,
      });
    }
  }
);

// Belirli bir influencer'ın coinlerini alma
router.get(
  "/:appUserId/influencer/:influencerId/coins",
  authenticateToken,
  async (req, res) => {
    try {
      const appUser = await AppUser.findById(req.params.appUserId);

      if (!appUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      const influencer = appUser.influencers.id(req.params.influencerId);

      if (!influencer) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      res.json(influencer.coins);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Tek bir coin almak
router.get(
  "/:appUserId/influencer/:influencerId/coins/:coinId",
  authenticateToken,
  async (req, res) => {
    try {
      const appUser = await AppUser.findById(req.params.appUserId);
      if (!appUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      const influencer = appUser.influencers.id(req.params.influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const coin = influencer.coins.id(req.params.coinId);
      if (!coin) {
        return res.status(404).json({ message: "Coin bulunamadı" });
      }

      res.json(coin);
    } catch (err) {
      console.error("Coin alınırken hata oluştu:", err);
      res.status(500).json({ message: "Coin alınırken hata oluştu." });
    }
  }
);

// Belirli bir influencer'a coin ekleme
router.post(
  "/:appUserId/influencer/:influencerId/coins",
  authenticateToken,
  async (req, res) => {
    try {
      const appUser = await AppUser.findById(req.params.appUserId);
      if (!appUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      const influencer = appUser.influencers.id(req.params.influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const caAddress = req.body.caAddress;

      // CA adresinden coin verilerini al
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${caAddress}`
      );
      const pairs = response.data.pairs;
      if (!pairs || pairs.length === 0) {
        console.error("DexScreener API yanıtında coin bulunamadı.");
        return res.status(400).json({ message: "Coin verileri alınamadı." });
      }

      const pair = pairs[0];
      const tokenData = pair.baseToken;

      // shareDate ve shareMarketCap'i alıyoruz
      const shareDate = new Date(req.body.shareDate);
      const shareMarketCap = req.body.shareMarketCap;

      const newCoin = {
        symbol: tokenData.symbol,
        name: tokenData.name,
        caAddress: caAddress,
        shareDate: shareDate,
        sharePrice: req.body.sharePrice,
        shareMarketCap: shareMarketCap,
      };

      influencer.coins.push(newCoin);
      await appUser.save();

      // Yeni eklenen coin'i almak için
      const addedCoin = influencer.coins[influencer.coins.length - 1];

      res.status(201).json(addedCoin);
    } catch (err) {
      console.error("Hata:", err);
      res
        .status(400)
        .json({ message: `Coin eklenirken hata oluştu: ${err.message}` });
    }
  }
);

// Belirli bir kullanıcıya coin ekleme
router.post("/:appUserId/coins", async (req, res) => {
  try {
    // Kullanıcıyı 'findById' ile buluyoruz
    const appUser = await AppUser.findById(req.params.appUserId);
    if (!appUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const caAddress = req.body.caAddress;

    // CA adresinden coin verilerini al
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${caAddress}`
    );

    const pairs = response.data.pairs;
    if (!pairs || pairs.length === 0) {
      console.error("DexScreener API yanıtında coin bulunamadı.");
      return res.status(400).json({ message: "Coin verileri alınamadı." });
    }

    const pair = pairs[0];
    const tokenData = pair.baseToken;

    // shareDate ve shareMarketCap'i alıyoruz
    const shareDate = new Date(req.body.shareDate);
    const shareMarketCap = req.body.shareMarketCap;

    const newCoin = {
      symbol: tokenData.symbol,
      name: tokenData.name,
      caAddress: caAddress,
      shareDate: shareDate,
      sharePrice: req.body.sharePrice,
      shareMarketCap: shareMarketCap,
    };

    appUser.coins.push(newCoin);
    await appUser.save();

    // Yeni eklenen coin'i almak için
    const addedCoin = appUser.coins[appUser.coins.length - 1];

    res.status(201).json(addedCoin);
  } catch (err) {
    console.error("Hata:", err);
    if (err.name === "ValidationError") {
      const errors = Object.keys(err.errors).map((key) => ({
        field: key,
        message: err.errors[key].message,
      }));
      return res.status(400).json({ message: "Validation Error", errors });
    }
    res
      .status(400)
      .json({ message: `Coin eklenirken hata oluştu: ${err.message}` });
  }
});

// Belirli bir influencer'dan coin silme
router.delete(
  "/:appUserId/influencer/:influencerId/coins/:coinId",
  authenticateToken,
  async (req, res) => {
    try {
      const appUser = await AppUser.findById(req.params.appUserId);
      if (!appUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      const influencer = appUser.influencers.id(req.params.influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const coin = influencer.coins.id(req.params.coinId);
      if (!coin) {
        return res.status(404).json({ message: "Coin bulunamadı" });
      }

      // coin.remove(); // Bu satırı değiştiriyoruz
      influencer.coins.pull(req.params.coinId); // Coin'i coins dizisinden kaldırıyoruz

      await appUser.save();

      res.status(200).json({ message: "Coin silindi" });
    } catch (err) {
      console.error("Coin silinirken hata oluştu:", err);
      res.status(500).json({ message: "Coin silinirken hata oluştu." });
    }
  }
);

// Belirli bir kullanıcıdan coin silme
router.delete("/:appUserId/coins/:coinId", async (req, res) => {
  try {
    const result = await AppUser.updateOne(
      { _id: req.params.appUserId },
      { $pull: { coins: { _id: req.params.coinId } } }
    );
    if (result.nModified === 0) {
      return res.status(404).json({ message: "Coin bulunamadı" });
    }
    res.status(200).json({ message: "Coin silindi" });
  } catch (err) {
    console.error("Hata:", err);
    res.status(400).json({ message: "Coin silinirken hata oluştu." });
  }
});

// Favori kullanıcı ekleme
router.put(
  "/:appUserId/influencers/:influencerId/favorite",
  authenticateToken,
  async (req, res) => {
    try {
      const appUser = await AppUser.findById(req.params.appUserId);
      const influencer = appUser.influencers.id(req.params.influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Fenomen bulunamadı" });
      }
      influencer.isFavorite = true;
      await appUser.save();
      res.json(influencer);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Favori kullanıcıdan çıkarma
router.delete(
  "/:appUserId/influencers/:influencerId/favorite",
  authenticateToken,
  async (req, res) => {
    try {
      const appUser = await AppUser.findById(req.params.appUserId);
      const influencer = appUser.influencers.id(req.params.influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Fenomen bulunamadı" });
      }
      influencer.isFavorite = false;
      await appUser.save();
      res.json(influencer);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// appUser bir fenomenin belirli bir coini güncelleyebilecek
router.put(
  "/:appUserId/influencer/:influencerId/coins/:coinId",
  async (req, res) => {
    try {
      const appUser = await AppUser.findById(req.params.appUserId);
      if (!appUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      const influencer = appUser.influencers.id(req.params.influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Fenomen bulunamadı" });
      }

      const coin = influencer.coins.id(req.params.coinId);
      if (!coin) {
        return res.status(404).json({ message: "Coin bulunamadı" });
      }

      coin.shareDate = req.body.shareDate || coin.shareDate;
      coin.sharePrice = req.body.sharePrice || coin.sharePrice;
      coin.shareMarketCap = req.body.shareMarketCap || coin.shareMarketCap;

      await appUser.save();
      res.json(coin);
    } catch (err) {
      console.error("Coin güncellenirken hata oluştu:", err);
      res.status(500).json({ message: "Coin güncellenirken hata oluştu" });
    }
  }
);

// Belirli bir coin'i favori yapma
router.put(
  "/:appUserId/influencer/:influencerId/coins/:coinId/favorite",
  authenticateToken,
  async (req, res) => {
    try {
      const appUser = await AppUser.findById(req.params.appUserId);
      if (!appUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      const influencer = appUser.influencers.id(req.params.influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const coin = influencer.coins.id(req.params.coinId);
      if (!coin) {
        return res.status(404).json({ message: "Coin bulunamadı" });
      }

      coin.isFavorite = true;
      await appUser.save();
      res.json(coin);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Belirli bir coin'i favorilerden çıkarma
router.delete(
  "/:appUserId/influencer/:influencerId/coins/:coinId/favorite",
  authenticateToken,
  async (req, res) => {
    try {
      const appUser = await AppUser.findById(req.params.appUserId);
      if (!appUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      const influencer = appUser.influencers.id(req.params.influencerId);
      if (!influencer) {
        return res.status(404).json({ message: "Influencer bulunamadı" });
      }

      const coin = influencer.coins.id(req.params.coinId);
      if (!coin) {
        return res.status(404).json({ message: "Coin bulunamadı" });
      }

      coin.isFavorite = false;
      await appUser.save();
      res.json(coin);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Favori kullanıcıları alma rotası (JWT ile kimlik doğrulama)
router.get("/:appUserId/favorites", authenticateToken, async (req, res) => {
  try {
    const appUser = await AppUser.findById(req.params.appUserId);
    if (!appUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const favorites = appUser.influencers.filter(
      (influencer) => influencer.isFavorite
    );
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Kullanıcının favori coinlerini alma
router.get(
  "/:appUserId/coins/favorites",
  authenticateToken,
  async (req, res) => {
    try {
      const appUser = await AppUser.findById(req.params.appUserId);
      if (!appUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      // Favori coinleri toplamak için boş bir dizi oluşturuyoruz
      const favoriteCoins = [];

      // Kullanıcının influencer listesine gidip, her influencer'daki coinleri döngüyle kontrol ediyoruz
      appUser.influencers.forEach((influencer) => {
        influencer.coins.forEach((coin) => {
          if (coin.isFavorite) {
            // Favori olarak işaretlenmiş coinleri seçiyoruz
            favoriteCoins.push({
              ...coin.toObject(), // Coinin tüm özelliklerini alıyoruz
              influencerName: influencer.name, // Influencer bilgilerini ekliyoruz
              influencerTwitter: influencer.twitter,
              influencerId: influencer._id, // Influencer ID'sini ekliyoruz
            });
          }
        });
      });

      res.json(favoriteCoins); // Favori coinleri döndür
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// AppUser kendi fenomenlerinin kar/zarar ortalamasını görüntüleyebilir
// Kullanıcıya özel ortalama kâr/zarar tablosu
router.get("/:userId/average-profits", async (req, res) => {
  try {
    const userId = req.params.userId;

    const appUser = await AppUser.findById(userId);

    if (!appUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    let totalProfit = 0;
    let validCoinCount = 0;
    const coinMarketCapCache = {};
    const influencerData = [];

    const influencerPromises = appUser.influencers.map(async (influencer) => {
      const influencerProfitData = {
        influencerId: influencer._id,
        influencerName: influencer.name,
        totalProfit: 0,
        coinCount: influencer.coins.length,
      };

      const coinPromises = influencer.coins.map(async (coin) => {
        const caAddress = coin.caAddress;

        if (!coinMarketCapCache[caAddress]) {
          try {
            const response = await axios.get(
              `https://api.dexscreener.com/latest/dex/tokens/${caAddress}`
            );
            const pairs = response.data.pairs;

            if (pairs && pairs.length > 0) {
              const pair = pairs[0];
              coinMarketCapCache[caAddress] = pair.marketCap;
            } else {
              coinMarketCapCache[caAddress] = null;
            }
          } catch (err) {
            console.error(`DexScreener API isteğinde hata: ${err.message}`);
            coinMarketCapCache[caAddress] = null;
          }
        }

        const currentMarketCap = coinMarketCapCache[caAddress];
        const shareMarketCap = coin.shareMarketCap;

        if (currentMarketCap && shareMarketCap) {
          const profitPercentage =
            ((currentMarketCap - shareMarketCap) / shareMarketCap) * 100;
          influencerProfitData.totalProfit += profitPercentage;
          totalProfit += profitPercentage;
          validCoinCount += 1;
        }
      });

      await Promise.all(coinPromises);
      influencerData.push(influencerProfitData);
    });

    await Promise.all(influencerPromises);

    const averageProfit = validCoinCount > 0 ? totalProfit / validCoinCount : 0;

    res.json({
      userId: appUser._id,
      userName: appUser.name,
      avgProfit: averageProfit,
      coinCount: validCoinCount,
      influencers: influencerData,
    });
  } catch (err) {
    console.error(
      "Kullanıcıya özel kâr/zarar ortalaması alınırken hata oluştu:",
      err
    );
    res
      .status(500)
      .json({ message: "Kâr/zarar ortalaması alınırken hata oluştu." });
  }
});

// AppUser için öne çıkan fenomen ve coin bilgilerini getir
router.get("/:appUserId/influencers/highlights", async (req, res) => {
  const { appUserId } = req.params;

  // ObjectId doğrulaması
  if (!mongoose.Types.ObjectId.isValid(appUserId)) {
    return res.status(400).json({ message: "Geçersiz kullanıcı ID'si" });
  }

  try {
    const appUser = await AppUser.findById(appUserId).populate("influencers");
    if (!appUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const influencers = appUser.influencers;
    if (!influencers || influencers.length === 0) {
      return res.status(404).json({ message: "Influencer bulunamadı" });
    }

    let highestAvgProfitUser = null;
    let highestAvgProfit = -Infinity;

    let highestProfitCoin = null;
    let highestProfit = -Infinity;

    let mostCoinsInfluencer = null;
    let mostCoinsCount = -1;

    const coinMarketCapCache = {};
    const coinList = [];

    // Influencer'ların coin verilerini topla
    for (const influencer of influencers) {
      const coins = influencer.coins || [];

      // En çok coine sahip influencer kontrolü
      if (coins.length > mostCoinsCount) {
        mostCoinsCount = coins.length;
        mostCoinsInfluencer = influencer;
      }

      for (const coin of coins) {
        coinList.push({ coin, influencer });
      }
    }

    if (!coinList.length) {
      return res
        .status(404)
        .json({ message: "Influencerların coin bilgisi bulunamadı" });
    }

    const coinPromises = coinList.map(async (item) => {
      const { coin, influencer } = item;
      const caAddress = coin.caAddress;

      // Coin market cap cache kontrolü
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
            coinMarketCapCache[caAddress] = null;
          }
        } catch (err) {
          console.error(`DexScreener API isteğinde hata: ${err.message}`);
          coinMarketCapCache[caAddress] = null;
        }
      }

      const currentMarketCap = coinMarketCapCache[caAddress];
      const shareMarketCap = coin.shareMarketCap;

      if (!currentMarketCap || !shareMarketCap) {
        return null;
      }

      const profitPercentage =
        ((currentMarketCap - shareMarketCap) / shareMarketCap) * 100;

      // En yüksek kâr sağlayan coini bul
      if (profitPercentage > highestProfit) {
        highestProfit = profitPercentage;
        highestProfitCoin = {
          ...coin.toObject(),
          profitPercentage,
          influencerName: influencer.name,
        };
      }

      // Her influencer'ın ortalama kâr yüzdesini güncelle
      influencer.totalProfit = (influencer.totalProfit || 0) + profitPercentage;
      influencer.coinCount = (influencer.coinCount || 0) + 1;

      return profitPercentage;
    });

    await Promise.all(coinPromises);

    // En yüksek ortalama kâr yüzdesine sahip influencer'ı bul
    for (const influencer of influencers) {
      const avgProfit = influencer.totalProfit / influencer.coinCount;

      if (avgProfit > highestAvgProfit) {
        highestAvgProfit = avgProfit;
        highestAvgProfitUser = {
          _id: influencer._id,
          name: influencer.name,
          avgProfit,
        };
      }
    }

    // Sonuçları döndür
    res.json({
      _id: mostCoinsInfluencer ? mostCoinsInfluencer._id : null,
      highestAvgProfitUser,
      highestProfitCoin,
      mostCoinsInfluencer: mostCoinsInfluencer
        ? {
          _id: mostCoinsInfluencer._id,
            name: mostCoinsInfluencer.name,
            coinCount: mostCoinsCount,
          }
        : null,
    });
  } catch (err) {
    console.error("Öne çıkan veriler alınırken hata oluştu:", err);
    res.status(500).json({
      message: "Öne çıkan veriler alınırken hata oluştu.",
      error: err.message,
    });
  }
});

// Kullanıcıları alma veya favorilere göre filtreleme
router.get("/:appUserId/influencers/favorites", async (req, res) => {
  try {
    const { favorite } = req.query;
    const appUser = await AppUser.findById(req.params.appUserId);

    if (!appUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    let influencers;
    if (favorite === "true") {
      influencers = appUser.coins.filter((coin) => coin.isFavorite);
    } else {
      influencers = appUser.coins;
    }

    res.json(influencers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Belirli bir influencer'ı alma
router.get("/:appUserId/influencer/:influencerId", async (req, res) => {
  try {
    const appUser = await AppUser.findById(req.params.appUserId);

    if (!appUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const influencer = appUser.influencers.id(req.params.influencerId);

    if (!influencer) {
      return res.status(404).json({ message: "Influencer bulunamadı" });
    }

    res.json(influencer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
