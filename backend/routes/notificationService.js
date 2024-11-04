// services/notificationService.js

const webpush = require('web-push');
const AppUser = require('../models/AppUser');

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function sendNotification(payload) {
  try {
    const subscribedUsers = await AppUser.find({ pushSubscription: { $exists: true } });

    subscribedUsers.forEach((user) => {
      webpush.sendNotification(user.pushSubscription, JSON.stringify(payload))
        .catch(error => {
          console.error('Error sending notification:', error);
        });
    });
  } catch (error) {
    console.error('Error in sendNotification:', error);
  }
}

module.exports = {
  sendNotification,
};
