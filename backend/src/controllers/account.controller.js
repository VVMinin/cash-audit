const Account = require('../models/Account')

exports.list = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json({ accounts })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { name, type, balance, comment } = req.body
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' })
    }
    const bal = Number(balance)
    if (Number.isNaN(bal) || bal < 0) {
      return res.status(400).json({ error: 'Balance must be >= 0' })
    }
    const account = await Account.create({
      name,
      type,
      balance: bal,
      comment: comment || '',
      user: req.user.id,
    })
    res.status(201).json({ account })
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, type, balance, comment } = req.body
    const account = await Account.findOne({ _id: id, user: req.user.id })
    if (!account) {
      return res.status(404).json({ error: 'Account not found' })
    }
    if (name) account.name = name
    if (type) account.type = type
    if (balance !== undefined) {
      const bal = Number(balance)
      if (Number.isNaN(bal) || bal < 0) {
        return res.status(400).json({ error: 'Balance must be >= 0' })
      }
      account.balance = bal
    }
    if (comment !== undefined) account.comment = comment
    await account.save()
    res.json({ account })
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params
    const deleted = await Account.findOneAndDelete({ _id: id, user: req.user.id })
    if (!deleted) {
      return res.status(404).json({ error: 'Account not found' })
    }
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

