const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Get the token from the 'Authorization' header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token is present, return 401 Unauthorized
  if (!token) return res.sendStatus(401);

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user; // Attach user info to the request
    next();
  });
};

module.exports = authenticateToken;
