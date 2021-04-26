const mongoose = require('mongoose')
const User = require('./user.base')
const Borrow = require('../transactions/borrow.model')
const Setting = require('../setting.model')
const UDM = require('../udm/udm.base')
const Book = require('../book.model')
const Request = require('../request.model')
const borrowBook = require('../../function/borrowBook')
const axios = require('axios')

const Schema = mongoose.Schema

const memberASchema = new Schema()

memberASchema.methods.borrow = async function (bookid, libraryOpenTime, res) {
    const bookBorrowed = await Borrow.findOne({ bookid, userid: this._id, status: 'active' })

    // If already borrowed same book, return error
    if (bookBorrowed !== null) return res.status(400).json({ error: 'msgBorrowMultiple' })
    else {
        // Get number of books borrowed this month and get book limit from settings
        const numOfBooksBorrowed = await Borrow.countDocuments({ userid: this._id, status: 'active' })
        const userSettings = await Setting.findOne({ setting: 'USER' })
        const bookLimit = userSettings.options.academic_borrow.value

        // Check if book limit reached return error
        if (numOfBooksBorrowed >= bookLimit) return res.status(400).json({
            error: 'msgBorrowMemberLimit',
            limit: bookLimit
        })
        else
            UDM.findById(this.udmid)
                .select(['email', 'phone'])
                .then(result => {
                    borrowBook(this._id, result.email, result.phone, bookid, libraryOpenTime, res, true)
                })
    }
}

memberASchema.methods.requestBook = async function (isbn, res) {
    Request.findOne({ isbn })
        .then(request => {
            // Check if book is not already requested
            if (!request) {
                Book.findOne({ isbn })
                    .then(book => {
                        // Check if book is not already available in the library
                        if (!book) {
                            // Get book details from GoogleAPI
                            axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
                                .then(result => {
                                    if (result.data.totalItems === 0) return res.status(404).json({ error: 'msgGoogleAPI404' })
                                    else {
                                        // Try to add the book in request collection
                                        // if book details missing in GoogleAPI, catch error
                                        try {
                                            const newRequest = new Request({
                                                userid: this._id,
                                                isbn,
                                                title: result.data.items[0].volumeInfo.title,
                                                author: result.data.items[0].volumeInfo.authors,
                                                publisher: result.data.items[0].volumeInfo.publisher,
                                                publishedDate: result.data.items[0].volumeInfo.publishedDate
                                            })

                                            newRequest.save()
                                                .then(request => {
                                                    res.json({
                                                        message: 'msgRequestSuccess',
                                                        request
                                                    })
                                                })
                                                .catch(err => {
                                                    res.json({
                                                        error: 'msgUnexpectedError'
                                                    })
                                                    console.log(err)
                                                })
                                        }
                                        catch (e) {
                                            res.status(400).json({ error: 'msgGoogleAPI404Params' })
                                        }
                                    }
                                })
                        }
                        else
                            // Book already available in the library
                            res.status(400).json({ error: 'msgBookAlreadyAvailable' })
                    })
                    .catch(err => console.log(err))
            }
            else
                // Book already requested
                res.status(400).json({ error: 'msgBookAlreadyRequested' })
        })
}

const MemberA = User.discriminator('MemberA', memberASchema)

module.exports = MemberA