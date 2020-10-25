const mongoose = require('mongoose')
const Book = require('../book.model')
const Transaction = require('./transaction.base')

const Schema = mongoose.Schema

const reserveSchema = new Schema({
    isCancel: { type: Boolean, required: true, default: false }
})

const Reserve = Transaction.discriminator('Reserve', reserveSchema)

module.exports = Reserve