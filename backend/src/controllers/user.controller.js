const bcrypt = require('bcryptjs')
const User = require('../models/User')

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
})

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: toPublicUser(user) })
  } catch (err) {
    next(err)
  }
}

exports.updateMe = async (req, res, next) => {
  try {
    const { name, email } = req.body
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (email !== user.email) {
      const exists = await User.findOne({ email })
      if (exists) return res.status(409).json({ error: 'Email already in use' })
    }

    user.name = name
    user.email = email
    await user.save()

    res.json({ user: toPublicUser(user) })
  } catch (err) {
    next(err)
  }
}

exports.listAll = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role createdAt')
    res.json({ users: users.map(toPublicUser) })
  } catch (err) {
    next(err)
  }
}

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Требуются текущий и новый пароль' })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Текущий пароль неверный' })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    res.json({ message: 'Пароль успешно изменён' })
  } catch (err) {
    next(err)
  }
}

