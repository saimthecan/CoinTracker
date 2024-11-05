const nodemailer = require('nodemailer');

// Configure your email transporter (using Gmail as an example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
}); 

async function sendEmail(to, subject, text, html) {
  const mailOptions = {
    from: `"Coin Tracker" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
}

module.exports = {
  sendEmail,
};
