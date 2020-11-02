const mongoose = require('mongoose')

const Schema = mongoose.Schema

const paymentSchema = new Schema({
    userid: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookid: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    copyid: { type: Schema.Types.ObjectId, required: true },
    numOfDays: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    paid: { type: Boolean, required: true, default: false },
    paidDate: { type: Date },
    createdAt: { type: Date, default: Date() }
})

const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment