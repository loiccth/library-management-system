const mongoose = require('mongoose')

const Schema = mongoose.Schema

const bookSchema = new Schema({
    title: { type: String, required: true },
    author: { type: [String], required: true },
    isbn: { type: String, require: true, unique: true, minlength: 10, maxlength: 13 },
    publisher: { type: String, required: true },
    publishedDate: { type: Date, required: true },
    categories: { type: [String], required: true },
    description: { type: String, required: true },
    noOfPages: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    location: { type: String, required: true },
    campus: { type: String, required: true, enum: ['pam', 'rhill'] },
    noOfBooksOnLoan: { type: Number, required: true, default: 0 },
    noOfBooksOnHold: { type: Number, required: true, default: 0 },
    isHighDemand: { type: Boolean, default: false, required: true },
    copies: [{
        _id: { type: mongoose.ObjectId, default: mongoose.Types.ObjectId, unique: true },
        availability: { type: String, required: true, default: 'available', enum: ['available', 'onloan', 'onhold'] },
        borrower: {
            userid: { type: Schema.Types.ObjectId, ref: 'User' },
            borrowAt: { type: Date },
            dueDate: { type: Date },
            renews: { type: Number }
        },
    }],
    reservation: [{
        userid: { type: Schema.Types.ObjectId, ref: 'User' },
        reservedAt: { type: Date },
        expireAt: { type: Date }
    }],
    removed: [{
        _id: { type: mongoose.ObjectId },
        createdAt: { type: Date },
        reason: { type: String }
    }]
}, { timestamps: true })

const Book = mongoose.model('Book', bookSchema)

module.exports = Book