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

