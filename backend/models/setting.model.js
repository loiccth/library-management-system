const mongoose = require('mongoose')

const Schema = mongoose.Schema

const settingSchema = new Schema({
    setting: { type: String, required: true, unique: true },
    option: { type: String, required: false },
    options: { type: Schema.Types.Mixed, required: false }
}, { timestamps: true })

const Setting = mongoose.model('Setting', settingSchema)

module.exports = Setting