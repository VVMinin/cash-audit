const { Schema, model, Types } = require('mongoose')

const accountSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    balance: { type: Number, required: true, min: 0 },
    comment: { type: String, default: '' },
    user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

accountSchema.index({ user: 1, name: 1 })

module.exports = model('Account', accountSchema)

