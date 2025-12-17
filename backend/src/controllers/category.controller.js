const Category = require('../models/Category')

exports.list = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json({ categories })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { name, type, comment } = req.body
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' })
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Type must be income or expense' })
    }
    const category = await Category.create({
      name,
      type,
      comment: comment || '',
      user: req.user.id,
    })
    res.status(201).json({ category })
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, type, comment } = req.body
    const category = await Category.findOne({ _id: id, user: req.user.id })
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    if (name) category.name = name
    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Type must be income or expense' })
      }
      category.type = type
    }
    if (comment !== undefined) category.comment = comment
    await category.save()
    res.json({ category })
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params
    const deleted = await Category.findOneAndDelete({ _id: id, user: req.user.id })
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' })
    }
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

