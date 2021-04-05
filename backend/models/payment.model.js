const mongoose = require('mongoose')

const Schema = mongoose.Schema

const paymentSchema = new Schema({
    borrowid: { type: Schema.Types.ObjectId, ref: 'Borrow', required: true },
    userid: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookid: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    copyid: { type: Schema.Types.ObjectId, required: true },
    numOfDays: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    paid: { type: Boolean, required: true, default: false },
    paidDate: { type: Date }
}, { timestamps: true })

const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment