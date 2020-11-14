const mongoose = require('mongoose')
const Transaction = require('./transaction.base')

const Schema = mongoose.Schema

const reserveSchema = new Schema({
    expireAt: { type: Date },
    isCancel: { type: Boolean, required: true, default: false }
})

const Reserve = Transaction.discriminator('Reserve', reserveSchema)

module.exports = Reserve