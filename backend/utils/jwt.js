const jwt = require('jsonwebtoken');

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return process.env.JWT_SECRET;
};

const signAccessToken = (payload) =>
  jwt.sign(payload, getSecret(), { expiresIn: '1h' });

const verifyAccessToken = (token) => jwt.verify(token, getSecret());

module.exports = {
  signAccessToken,
  verifyAccessToken,
};



