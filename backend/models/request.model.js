const mongoose = require('mongoose')

const Schema = mongoose.Schema

// Schema for request
const requestSchema = new Schema({
    userid: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isbn: { type: String, require: true, unique: true, minlength: 10, maxlength: 13 },
    title: { type: String, required: true },
    author: { type: [String], required: true },
    publisher: { type: String, required: true },
    publishedDate: { type: Date, required: true }
}, { timestamps: true })

const Request = mongoose.model('Request', requestSchema)

module.exports = Request