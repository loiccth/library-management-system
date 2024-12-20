const mongoose = require('mongoose')
const UDM = require('./udm.base')

const Schema = mongoose.Schema

// Staff schema
// This schema inherits attribute of the base udm schema
const staffSchema = new Schema({
    staffType: { type: String, required: true, enum: ['ft', 'pt'] },
    academic: { type: Boolean, required: true },
    faculty: { type: String, enum: ['ict', 'ba', "eng"] },
    contractEndDate: { type: Date }
})

const Staff = UDM.discriminator('Staff', staffSchema)

module.exports = Staff