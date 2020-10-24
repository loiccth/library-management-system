const mongoose = require('mongoose')
const Transaction = require('./transaction.base')

const Schema = mongoose.Schema

const reserveSchema = new Schema()

const Reserve = Transaction.discriminator('Reserve', reserveSchema)

module.exports = Reserve