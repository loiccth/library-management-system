const mongoose = require('mongoose')
const User = require('./user.base')
const Borrow = require('../transactions/borrow.model')
const Setting = require('../setting.model')
const UDM = require('../udm/udm.base')
const borrowBook = require('../../function/borrowBook')

const Schema = mongoose.Schema

const memberSchema = new Schema()

memberSchema.methods.borrow = async function (bookid, libraryOpenTime, res) {
    const bookBorrowed = await Borrow.findOne({ bookid, userid: this._id, status: 'active' })

    // If already borrowed same book, return error
    if (bookBorrowed !== null) return res.status(400).json({ error: 'msgBorrowMultiple' })
    else {
        // Get number of books borrowed this month and get book limit from settings
        const numOfBooksBorrowed = await Borrow.countDocuments({ userid: this._id, status: 'active' })
        const userSettings = await Setting.findOne({ setting: 'USER' })
        const bookLimit = userSettings.options.student_borrow.value

        // Check if book limit reached return error
        if (numOfBooksBorrowed >= bookLimit) return res.status(400).json({
            error: 'msgBorrowMemberLimit',
            limit: bookLimit
        })
        else
            UDM.findById(this.udmid)
                .select(['email', 'phone'])
                .then(result => {
                    borrowBook(this._id, result.email, result.phone, bookid, libraryOpenTime, res)
                })
    }
}

const Member = User.discriminator('Member', memberSchema)

module.exports = Member