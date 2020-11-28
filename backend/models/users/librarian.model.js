const mongoose = require('mongoose')
const axios = require('axios')
const User = require('./user.base')
const Book = require('../book.model')
const Borrow = require('../transactions/borrow.model')
const Reserve = require('../transactions/reserve.model')
const Payment = require('../payment.model')
const Setting = require('../setting.model')
const csv = require('csv-parser')
const fs = require('fs')

const Schema = mongoose.Schema

const librarianSchema = new Schema()

librarianSchema.methods.borrow = async function (bookid, res) {
    const bookBorrowed = await Borrow.findOne({ bookid, userid: this._id, status: 'active' })

    if (bookBorrowed !== null) return res.json({ 'error': 'Cannot borrow multiple copies of the same book' })
    else {
        const date = new Date()
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        const numOfBooksBorrowed = await Borrow.countDocuments({ userid: this._id, createdAt: { $gte: firstDay, $lte: lastDay } })
        const bookLimit = await Setting.findOne({ setting: 'NONACADEMIC_BORROW' })

        if (numOfBooksBorrowed >= parseInt(bookLimit.option)) return res.json({ 'error': 'Cannot borrow more than 2 books in a month' })
        else {
            const now = new Date()
            const bookReserved = await Reserve.findOne({ bookid, userid: this._id, status: 'active', expireAt: { $gte: now } })

            if (bookReserved !== null) {
                bookReserved.status = 'archive'
                bookReserved.save().catch(err => console.log(err))

                Book.findOne({ _id: bookid })
                    .then(async book => {
                        if (book.reservation[0].userid.toString() === this._id.toString()) {
                            for (let i = 0; i < book.copies.length; i++) {
                                if (book.copies[i].availability === 'onhold') {
                                    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                    book.noOfBooksOnLoan = book.noOfBooksOnLoan + 1
                                    book.copies[i].availability = 'onloan'
                                    book.copies[i].borrower = {
                                        userid: this._id,
                                        borrowAt: Date(),
                                        dueDate,
                                        renews: 0
                                    }
                                    book.reservation.splice(0, 1)
                                    await book.save().catch(err => console.log(err))

                                    const newBorrow = new Borrow({
                                        userid: this._id,
                                        bookid,
                                        copyid: book.copies[i]._id,
                                        dueDate,
                                        isHighDemand: book.isHighDemand
                                    })
                                    await newBorrow.save().then(() => {
                                        return res.sendStatus(201)
                                    }).catch(err => console.log(err))
                                    break
                                }
                            }
                        }
                        else res.json({ 'error': 'User is not first in reservation queue' })
                    })
            }
            else {
                Book.findOne({ _id: bookid })
                    .then(async book => {
                        if (book.copies.length > book.noOfBooksOnLoan)
                            for (let i = 0; i < book.copies.length; i++) {
                                if (book.copies[i].availability === 'available') {
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
                                        isHighDemand: book.isHighDemand
                                    })
                                    await newBorrow.save().then(() => {
                                        return res.sendStatus(201)
                                    }).catch(err => console.log(err))
                                    break
                                }
                            }
                        else res.json({ 'error': 'No books available to loan' })
                    })
            }
        }
    }
}

librarianSchema.methods.addBook = async function (book, res) {
    const { location, campus, isbn } = book

    const googleBookAPI = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)

    if (googleBookAPI.data.totalItems === 0) res.json({ 'error': 'Invalid ISBN' })
    else {
        Book.findOne({ isbn })
            .then(book => {
                const { title, author, publisher, publishedDate, categories, description, pageCount, imageLinks } = googleBookAPI.data.items[0].volumeInfo
                if (book === null) {
                    const newBook = new Book({
                        title,
                        author,
                        isbn,
                        publisher,
                        publishedDate,
                        categories,
                        description,
                        noOfPages: pageCount,
                        thumbnail: imageLinks.thumbnail,
                        location,
                        campus,
                        copies: {}
                    })
                    newBook.save()
                        .then(() => res.sendStatus(201))
                        .catch(err => res.json({ 'error': err.message }))
                }
                else {
                    book.copies.push({})
                    book.save()
                        .then(() => res.sendStatus(201))
                        .catch(err => res.json({ 'error': err._message }))
                }
            })
            .catch(err => console.log(err))
    }
}

librarianSchema.methods.addBookCSV = function (file, res) {
    let success = []
    let fail = []

    const stream = fs.createReadStream(file)
        .pipe(csv())
        .on('data', async (book) => {
            stream.pause()
            const { location, campus, isbn } = book

            const googleBookAPI = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)

            if (googleBookAPI.data.totalItems === 0) {
                fail.push(isbn + ' - Invalid ISBN')
            }
            else {
                await Book.findOne({ isbn })
                    .then(async (book) => {
                        const { title, author, publisher, publishedDate, categories, description, pageCount, imageLinks } = googleBookAPI.data.items[0].volumeInfo
                        if (book === null) {
                            const newBook = new Book({
                                title,
                                author,
                                isbn,
                                publisher,
                                publishedDate,
                                categories,
                                description,
                                noOfPages: pageCount,
                                thumbnail: imageLinks.thumbnail,
                                location,
                                campus,
                                copies: {}
                            })
                            newBook.save()
                                .then(() => success.push(`${title} (${isbn})`))
                                .catch(err => fail.push(`${title} (${isbn}) - ${err.message}`))
                        }
                        else {
                            book.copies.push({})
                            await book.save()
                                .then(() => success.push(`${title} (${isbn})`))
                                .catch(err => fail.push(`${title} (${isbn}) - ${err.message}`))
                        }
                    })
                    .catch(err => console.log(err))
            }
            stream.resume()
        })
        .on('end', () => {
            setTimeout(() => {
                res.sendStatus(201).json({
                    success,
                    fail
                })
            }, 1000)
        })
}

librarianSchema.methods.returnBook = function (borrowid, res) {
    Borrow.findOne({ _id: borrowid })
        .then(async borrow => {
            borrow.returnedOn = Date()
            borrow.archive = true

            const now = new Date(new Date().toDateString())
            const borrowDate = new Date(borrow.dueDate.toDateString())
            let numOfDays = ((borrowDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

            if (numOfDays < 0) {
                numOfDays *= -1

                const newPayment = new Payment({
                    userid: borrow.userid,
                    bookid: borrow.bookid,
                    copyid: borrow.copyid,
                    numOfDays,
                    pricePerDay: 25
                })

                await newPayment.save().catch(err => console.log(err))
            }
            await borrow.save().catch(err => console.log(err))

            Book.findOne({ _id: borrow.bookid })
                .then(async book => {
                    book.noOfBooksOnLoan = book.noOfBooksOnLoan - 1
                    timeOnHold = await Setting.findOne({ setting: 'TIME_ON_HOLD' })
                    for (let i = 0; i < book.copies.length; i++) {
                        if (book.copies[i].borrower.userid.toString() === borrow.userid.toString()) {
                            if (book.reservation.length > 0) {
                                book.noOfBooksOnLoan = book.noOfBooksOnLoan + 1
                                book.copies[i].availability = 'onhold'
                                book.reservation[0] = {
                                    ...book.reservation[0],
                                    expireAt: new Date(new Date().getTime() + (parseInt(timeOnHold.option) * 1000))
                                }
                                Reserve.findOne({ _id: borrow.bookid, userid: book.reservation[0].userid, status: 'active' })
                                    .then(reserve => {
                                        reserve.expireAt = new Date(new Date().getTime() + (parseInt(timeOnHold.option) * 1000))

                                        reserve.save().catch(err => console.log(err))
                                    })

                                // TODO: Inform next member in reservation queue
                            }
                            else book.copies[i].availability = 'available'
                            book.copies[i].borrower = null
                            break
                        }
                    }
                    book.save().then(() => res.sendStatus(200)).catch(err => console.log)
                })
        })
}

librarianSchema.methods.getOverdueBooks = function (res) {
    const now = new Date(new Date().toDateString())

    Borrow.find({ status: 'active', dueDate: { $lt: now } }).populate('userid').populate('bookid')
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

librarianSchema.methods.getDueBooks = function (res) {
    const now = new Date(new Date().toDateString())
    const tomorrow = new Date(new Date(now).toDateString())
    tomorrow.setDate(tomorrow.getDate() + 1)

    Borrow.find({ status: 'active', dueDate: { $gte: now, $lt: tomorrow } }).populate('userid').populate('bookid')
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

librarianSchema.methods.issueBook = function (bookid, userid, res) {
    User.findById(userid)
        .then(user => {
            user.borrow(bookid)
        })
        .catch(err => console.log(err))
}

const Librarian = User.discriminator('Librarian', librarianSchema)

module.exports = Librarian