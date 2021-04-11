const mongoose = require('mongoose')
const Transaction = require('./transaction.base')

const Schema = mongoose.Schema

// Borrow transaction schema
// This schema inherits attribute of the base transaction
const borrowSchema = new Schema({
    copyid: { type: Schema.Types.ObjectId, required: true },
    renews: { type: Number, required: true, default: 0 },
    isHighDemand: { type: Boolean, required: true },
    dueDate: { type: Date, required: true },
    renewedOn: { type: [Date], required: true },
    returnedOn: { type: Date }
})

const Borrow = Transaction.discriminator('Borrow', borrowSchema)

module.exports = Borrow