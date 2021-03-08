const mongoose = require('mongoose')

const Schema = mongoose.Schema

const analyticsSchema = new Schema({
    sessionid: { type: String, required: true, unique: true },
    userid: { type: Schema.Types.ObjectId, ref: 'User' },
    guest: { type: Boolean },
    ip: { type: String, required: true },
    geolocation: {
        continentCode: { type: String, required: true },
        continentName: { type: String, required: true },
        countryCode: { type: String, required: true },
        countryName: { type: String, required: true },
        regionCode: { type: String, required: true },
        regionName: { type: String, required: true },
        city: { type: String, required: true }
    },
    device: { type: String, required: true },
    userAgent: { type: String, required: true },
    events: [{
        type: { type: String, require: true },
        path: { type: String },
        button: { type: String },
        time: { type: Date, default: Date.now }
    }]
}, { timestamps: true })

const Analytics = mongoose.model('Analytics', analyticsSchema)

module.exports = Analytics