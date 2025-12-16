const { Schema, model, Types } = require('mongoose')

const transactionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },
    account: { type: Types.ObjectId, ref: 'Account', required: true },
    category: { type: Types.ObjectId, ref: 'Category', required: true },
    amount: { type: Number, required: true, min: 0 },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    comment: { type: String, default: '' },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    date: { type: Date, required: true },
  },
  { timestamps: true }
)

transactionSchema.index({ user: 1, date: -1 })

module.exports = model('Transaction', transactionSchema)

