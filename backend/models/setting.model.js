const mongoose = require('mongoose')

const Schema = mongoose.Schema

const settingSchema = new Schema({
    setting: { type: String, required: true },
    option: { type: String, required: true },
    additionalOption: { type: String },
    createdAt: { type: Date, default: Date() }
})

const Setting = mongoose.model('Setting', settingSchema)

module.exports = Setting