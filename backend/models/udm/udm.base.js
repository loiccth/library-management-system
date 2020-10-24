const mongoose = require('mongoose')

const Schema = mongoose.Schema

const baseOptions = {
    discriminatorKey: 'udmType',
    collection: 'udm'
}

const baseUDMSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: Number, required: true, unique: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date() },
}, baseOptions)

const UDM = mongoose.model('UDM', baseUDMSchema)

module.exports = UDM