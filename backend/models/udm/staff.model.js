const mongoose = require('mongoose')
const UDM = require('./udm.base')

const Schema = mongoose.Schema

const staffSchema = new Schema({
    staffType: { type: String, required: true, enum: ['ft', 'pt'] },
    academic: { type: Boolean, required: true },
    contractEndDate: { type: Date }
})

const Staff = UDM.discriminator('Staff', staffSchema)

module.exports = Staff