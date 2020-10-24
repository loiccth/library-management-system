const mongoose = require('mongoose')
const User = require('./user.base')

const Schema = mongoose.Schema

const librarianSchema = new Schema()

const Librarian = User.discriminator('Librarian', librarianSchema)

module.exports = Librarian