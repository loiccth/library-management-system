const mongoose = require('mongoose')
const UDM = require('./udm.base')

const Schema = mongoose.Schema

// Student schema
// This schema inherits attribute of the base udm schema
const studentSchema = new Schema({
    studentid: { type: String, required: true, trim: true },
    studentType: { type: String, required: true, enum: ['ft', 'pt'] },
    faculty: { type: String, required: true, enum: ['ict', 'ba', "eng"] },
    course: { type: String, required: true },
    academicYear: { type: Number, required: true }
})

const Student = UDM.discriminator('Student', studentSchema)

module.exports = Student