const mongoose = require('mongoose')

const Schema = mongoose.Schema

const paymentSchema = new Schema({
    userid: {},
    bookid: {},
    numOfDays: {},
    pricePerDay: {},
    createdAt: { type: Date, default: Date() }
})

const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment