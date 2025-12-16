const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signAccessToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ name, email, passwordHash });
    const token = signAccessToken({ sub: user._id.toString() });

    return res.status(201).json({ user: toPublicUser(user), token });
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signAccessToken({ sub: user._id.toString() });
    return res.json({ user: toPublicUser(user), token });
  } catch (err) {
    return next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('name email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
};



