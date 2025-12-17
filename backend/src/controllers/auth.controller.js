const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Имя, email и пароль обязательны' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword
    });

    if (!user || !user._id) {
      console.error('Ошибка: пользователь не создан');
      return res.status(500).json({ error: 'Ошибка создания пользователя' });
    }

    const token = generateToken(user._id.toString(), user.role || 'user');

    console.log('Пользователь успешно создан:', user.email);

    return res.status(201).json({
      token,
      user: toPublicUser(user)
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    return res.status(500).json({ error: 'Ошибка регистрации' });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = generateToken(user._id.toString(), user.role || 'user');
    
    return res.status(200).json({
      token,
      user: toPublicUser(user)
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    return res.status(500).json({ error: 'Ошибка входа' });
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
};


