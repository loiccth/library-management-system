const mongoose = require('mongoose')
const Transaction = require('./transaction.base')

const Schema = mongoose.Schema

// Reserve transaction schema
// This schema inherits attribute of the base transaction
const reserveSchema = new Schema({
    expireAt: { type: Date },
    isCancel: { type: Boolean, required: true, default: false }
})

const Reserve = Transaction.discriminator('Reserve', reserveSchema)

module.exports = Reserve