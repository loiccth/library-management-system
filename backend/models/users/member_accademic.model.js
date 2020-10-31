const mongoose = require('mongoose')
const User = require('./user.base')

const Schema = mongoose.Schema

const memberASchema = new Schema()

const MemberA = User.discriminator('MemberA', memberASchema)

module.exports = MemberA