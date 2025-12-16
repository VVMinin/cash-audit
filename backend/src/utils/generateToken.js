const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }

  return jwt.sign({ sub: userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = generateToken;


