const mongoose = require('mongoose')

const Schema = mongoose.Schema

const baseOptions = {
    discriminatorKey: 'transactionType',
    collection: 'transactions'
}

const baseTransactionSchema = new Schema({
    userid: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookid: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    copyid: { type: Schema.Types.ObjectId, required: true },
    archive: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, default: Date() },
}, baseOptions)

const Transaction = mongoose.model('Transaction', baseTransactionSchema)

module.exports = Transaction