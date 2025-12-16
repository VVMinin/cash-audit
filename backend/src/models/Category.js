const { Schema, model, Types } = require('mongoose')

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    comment: { type: String, default: '' },
    user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

categorySchema.index({ user: 1, name: 1 })

module.exports = model('Category', categorySchema)

