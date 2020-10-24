const mongoose = require('mongoose')
const User = require('./user.base')

const Schema = mongoose.Schema

const memberSchema = new Schema()

const Member = User.discriminator('Member', memberSchema)

module.exports = Member