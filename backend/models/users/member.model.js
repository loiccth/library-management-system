const mongoose = require('mongoose')
const User = require('./user.base')
const Borrow = require('../transactions/borrow.model')
const Book = require('../book.model')

const Schema = mongoose.Schema

const memberSchema = new Schema()

memberSchema.methods.borrow = async function (bookid, res) {
    const bookBorrowed = await Borrow.findOne({ bookid, userid: this._id, archive: false })

    if (bookBorrowed !== null) return res.status(400).json({ 'error': 'Cannot borrow multiple copies of the same book' })
    else {
        const numOfBooksBorrowed = await Borrow.countDocuments({ userid: this._id, archive: false })

        if (numOfBooksBorrowed > 2) return res.status(400).json({ 'error': 'Cannot borrow more than 2 books at the same time' })
        else {
            Book.findOne({ _id: bookid })
                .then(async book => {
                    let bookAvailable = false
                    for (let i = 0; i < book.copies.length; i++) {
                        if (book.copies[i].availability === 'available') {
                            bookAvailable = true
                            const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            book.noOfBooksOnLoan = book.noOfBooksOnLoan + 1
                            book.copies[i].availability = 'onloan'
                            book.copies[i].borrower = {
                                userid: this._id,
                                borrowAt: Date(),
                                dueDate,
                                renews: 0
                            }
                            await book.save().catch(err => console.log(err))

                            const newBorrow = new Borrow({
                                userid: this._id,
                                bookid,
                                copyid: book.copies[i]._id,
                                dueDate,
                            })
                            await newBorrow.save().then(() => {
                                return res.sendStatus(201)
                            }).catch(err => console.log(err))
                            break
                        }
                    }
                    if (!bookAvailable) res.json({ err: 'No books available to loan' })
                })
        }
    }
}

const Member = User.discriminator('Member', memberSchema)

module.exports = Member