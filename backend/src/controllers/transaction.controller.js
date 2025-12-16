const Transaction = require('../models/Transaction')
const Account = require('../models/Account')
const Category = require('../models/Category')
const { Types } = require('mongoose')

const parsePagination = (req) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))
  return { page, limit }
}

const aggregateSummary = async (userId) => {
  const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId
  const totalsAgg = await Transaction.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ])

  const incomeTotal = totalsAgg.find((t) => t._id === 'income')?.total || 0
  const expenseTotal = totalsAgg.find((t) => t._id === 'expense')?.total || 0

  const byCategory = await Transaction.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        type: { $first: '$type' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: 0,
        categoryId: '$category._id',
        name: '$category.name',
        icon: '$category.icon',
        type: '$type',
        total: 1,
      },
    },
  ])

  return {
    income: incomeTotal,
    expense: expenseTotal,
    byCategory,
  }
}

exports.list = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req)
    const { account, category, dateFrom, dateTo } = req.query
    const userId = req.user.id

    const filter = { user: userId }
    if (account) filter.account = account
    if (category) filter.category = category
    if (dateFrom || dateTo) {
      filter.date = {}
      if (dateFrom) filter.date.$gte = new Date(dateFrom)
      if (dateTo) filter.date.$lte = new Date(dateTo)
    }

    const total = await Transaction.countDocuments(filter)
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('account', 'name type icon')
      .populate('category', 'name type icon')

    const summary = await aggregateSummary(filter.user)

    res.json({
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
      summary,
    })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { account, category, amount, comment, date } = req.body
    if (!account || !category || !amount || !date) {
      return res.status(400).json({ error: 'account, category, amount, date are required' })
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' })
    }
    const accountDoc = await Account.findOne({ _id: account, user: req.user.id })
    if (!accountDoc) {
      return res.status(400).json({ error: 'Account not found' })
    }
    const categoryDoc = await Category.findOne({ _id: category, user: req.user.id })
    if (!categoryDoc) {
      return res.status(400).json({ error: 'Category not found' })
    }

    const amt = Number(amount)

    const balanceBefore = accountDoc.balance
    let balanceAfter = balanceBefore
    if (categoryDoc.type === 'expense') {
      balanceAfter = balanceBefore - amt
      if (balanceAfter < 0) {
        return res.status(400).json({ error: 'Insufficient funds on account' })
      }
    } else {
      balanceAfter = balanceBefore + amt
    }
    accountDoc.balance = balanceAfter
    await accountDoc.save()

    const tx = await Transaction.create({
      user: req.user.id,
      account,
      category,
      amount: amt,
      balanceBefore,
      balanceAfter,
      comment: comment || '',
      type: categoryDoc.type,
      date: new Date(date),
    })
    const populated = await tx.populate([
      { path: 'account', select: 'name type balance comment' },
      { path: 'category', select: 'name type comment' },
    ])
    res.status(201).json({ transaction: populated })
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params
    const { account, category, amount, comment, date } = req.body
    const tx = await Transaction.findOne({ _id: id, user: req.user.id })
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' })
    }
    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' })
    }

    const oldAccount = await Account.findOne({ _id: tx.account, user: req.user.id })
    if (!oldAccount) return res.status(400).json({ error: 'Account not found' })
    oldAccount.balance = tx.balanceBefore
    await oldAccount.save()

    const newAccountId = account || tx.account
    const newAccount = await Account.findOne({ _id: newAccountId, user: req.user.id })
    if (!newAccount) return res.status(400).json({ error: 'Account not found' })

    const categoryId = category || tx.category
    const categoryDoc = await Category.findOne({ _id: categoryId, user: req.user.id })
    if (!categoryDoc) return res.status(400).json({ error: 'Category not found' })

    const newAmount = amount !== undefined ? Number(amount) : tx.amount
    const newType = categoryDoc.type

    const balanceBefore = newAccount.balance
    let balanceAfter = balanceBefore
    if (newType === 'expense') {
      balanceAfter = balanceBefore - newAmount
      if (balanceAfter < 0) {
        return res.status(400).json({ error: 'Insufficient funds on account' })
      }
    } else {
      balanceAfter = balanceBefore + newAmount
    }
    newAccount.balance = balanceAfter
    await newAccount.save()

    tx.account = newAccountId
    tx.category = categoryId
    tx.amount = newAmount
    tx.type = newType
    tx.balanceBefore = balanceBefore
    tx.balanceAfter = balanceAfter
    if (comment !== undefined) tx.comment = comment
    if (date) tx.date = new Date(date)

    await tx.save()
    const populated = await tx.populate([
      { path: 'account', select: 'name type balance comment' },
      { path: 'category', select: 'name type comment' },
    ])
    res.json({ transaction: populated })
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params
    const tx = await Transaction.findOne({ _id: id, user: req.user.id })
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' })
    }
    const account = await Account.findOne({ _id: tx.account, user: req.user.id })
    if (!account) return res.status(400).json({ error: 'Account not found' })

    account.balance = tx.balanceBefore
    await account.save()
    await tx.deleteOne()
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params
    const tx = await Transaction.findOne({ _id: id, user: req.user.id })
      .populate('account', 'name type balance comment')
      .populate('category', 'name type comment')
    if (!tx) return res.status(404).json({ error: 'Transaction not found' })
    res.json({ transaction: tx })
  } catch (err) {
    next(err)
  }
}

exports.analytics = async (req, res, next) => {
  try {
    const summary = await aggregateSummary(req.user.id)
    res.json(summary)
  } catch (err) {
    next(err)
  }
}

