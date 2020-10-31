const mongoose = require('mongoose')
const User = require('./user.base')

const Schema = mongoose.Schema

const memberNASchema = new Schema()

const MemberNA = User.discriminator('MemberNA', memberNASchema)

module.exports = MemberNA