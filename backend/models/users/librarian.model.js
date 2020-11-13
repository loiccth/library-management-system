const mongoose = require('mongoose')
const User = require('./user.base')
const Book = require('../book.model')
const Borrow = require('../transactions/borrow.model')
const Payment = require('../payment.model')
const csv = require('csv-parser')
const fs = require('fs')

const Schema = mongoose.Schema

const librarianSchema = new Schema()

librarianSchema.methods.addBook = function (book, res) {
    const { title, author, isbn, publisher, publishedDate, edition, category, description, noOfPages, location, campus, purchasedOn } = book

    if (title === null || author === null || isbn === null || publisher === null || publishedDate === null || edition === null || category === null
        || description === null || noOfPages === null || location === null || campus === null || purchasedOn === null) return res.json({ 'error': 'Missing params' })
    else {
        Book.findOne({ isbn })
            .then(book => {
                if (book === null) {
                    const newBook = new Book({
                        title,
                        author,
                        isbn,
                        publisher,
                        publishedDate,
                        edition,
                        category,
                        description,
                        noOfPages,
                        location,
                        campus,
                        copies: {}
                    })
                    newBook.save()
                        .then(() => res.sendStatus(201))
                        .catch(err => res.json({ 'error': err._message }))
                }
                else {
                    book.copies.push({
                        purchasedOn
                    })
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
            const { title, author, isbn, publisher, publishedDate, edition, category, description, noOfPages, location, campus } = book

            await Book.findOne({ isbn })
                .then(async (book) => {
                    if (book === null) {
                        const newBook = new Book({
                            title,
                            author,
                            isbn,
                            publisher,
                            publishedDate,
                            edition,
                            category,
                            description,
                            noOfPages,
                            location,
                            campus,
                            copies: {}
                        })
                        newBook.save()
                            .then(() => success.push(title))
                            .catch((err) => fail.push(title + ' - ' + err.message))
                    }
                    else {
                        book.copies.push({})
                        await book.save()
                            .then(() => success.push(title))
                            .catch((err) => fail.push(title + ' - ' + err.message))
                    }
                })
                .catch(err => console.log(err))
            stream.resume()
        })
        .on('end', () => {
            setTimeout(() => {
                res.json({
                    success,
                    fail
                })
            }, 500)
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
                .then(book => {
                    book.noOfBooksOnLoan = book.noOfBooksOnLoan - 1
                    for (let i = 0; i < book.copies.length; i++) {
                        if (book.copies[i].borrower.userid.toString() === borrow.userid.toString()) {
                            book.copies[i].availability = 'onhold',
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

    Borrow.find({ archive: false, dueDate: { $lt: now } }).populate('userid').populate('bookid')
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

librarianSchema.methods.getDueBooks = function (res) {
    const now = new Date(new Date().toDateString())
    const tomorrow = new Date(new Date(now).toDateString())
    tomorrow.setDate(tomorrow.getDate() + 1)

    Borrow.find({ archive: false, dueDate: { $gte: now, $lt: tomorrow } }).populate('userid').populate('bookid')
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

const Librarian = User.discriminator('Librarian', librarianSchema)

module.exports = Librarian