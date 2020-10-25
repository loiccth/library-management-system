const mongoose = require('mongoose')

const Schema = mongoose.Schema

const settingSchema = new Schema({
    setting: { type: String, required: true },
    option: { type: String, required: true }
})

const Setting = mongoose.model('Setting', settingSchema)

module.exports = Setting