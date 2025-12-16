const { verifyAccessToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};



