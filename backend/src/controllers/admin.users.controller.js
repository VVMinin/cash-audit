const bcrypt = require('bcryptjs')
const User = require('../models/User')

// Административное управление пользователями (CRUD)

const toPublic = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  role: user.role,
})

exports.list = async (req, res, next) => {
  try {
    const users = await User.find().select('email name role')
    console.log('[admin] list users by', req.user.id)
    res.json({ users: users.map(toPublic) })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { email, password, name, role = 'user' } = req.body
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, name are required' })
    }
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ error: 'Email already in use' })
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, password: hash, name, role })
    console.log('[admin] created user', user._id.toString())
    res.status(201).json({ user: toPublic(user) })
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params
    const { email, name, role } = req.body
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (email && email !== user.email) {
      const exists = await User.findOne({ email })
      if (exists) return res.status(409).json({ error: 'Email already in use' })
      user.email = email
    }
    if (name) user.name = name
    if (role) user.role = role

    await user.save()
    console.log('[admin] updated user', user._id.toString())
    res.json({ user: toPublic(user) })
  } catch (err) {
    next(err)
  }
}

exports.updatePassword = async (req, res, next) => {
  try {
    const { id } = req.params
    const { password } = req.body
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const hash = await bcrypt.hash(password, 10)
    user.password = hash
    await user.save()
    console.log('[admin] password reset for user', user._id.toString())
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete self' })
    }
    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ error: 'User not found' })
    console.log('[admin] deleted user', id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}


