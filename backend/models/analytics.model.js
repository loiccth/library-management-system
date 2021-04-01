const mongoose = require('mongoose')

const Schema = mongoose.Schema

const analyticsSchema = new Schema({
    sessionid: { type: String, required: true },
    sessionDate: { type: Date, required: true },
    userid: { type: Schema.Types.ObjectId, ref: 'User' },
    ip: { type: String, required: true },
    geolocation: {
        continentCode: { type: String },
        continentName: { type: String },
        countryCode: { type: String },
        countryName: { type: String },
        regionCode: { type: String },
        regionName: { type: String },
        city: { type: String }
    },
    device: { type: String, required: true },
    userAgent: { type: String, required: true },
    event: {
        type: { type: String, require: true },
        info: { type: Schema.Types.Mixed, required: false }
    }
}, { timestamps: true })

const Analytics = mongoose.model('Analytics', analyticsSchema)

module.exports = Analytics