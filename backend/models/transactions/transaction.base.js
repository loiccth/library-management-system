const mongoose = require('mongoose')

const Schema = mongoose.Schema

const baseOptions = {
    discriminatorKey: 'transactionType',
    collection: 'transactions',
    timestamps: true
}

// Base transaction schema, other schemas will inherit from this one
const baseTransactionSchema = new Schema({
    userid: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookid: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    status: { type: String, required: true, default: 'active', enum: ['active', 'expired', 'archive'] },
}, baseOptions)

const Transaction = mongoose.model('Transaction', baseTransactionSchema)

module.exports = Transaction