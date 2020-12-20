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
const transporter = require('../../config/mail.config')

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

            Book.findOne({ _id: bookid })
                .then(async book => {
                    let dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    if (book.isHighDemand === true) {
                        const tomorrow = new Date()
                        tomorrow.setDate(tomorrow.getDate() + 2)
                        tomorrow.setHours(0, 0, 0, 0)

                        const dayOfWeek = tomorrow.getDay()
                        let libraryOpenTime
                        switch (dayOfWeek) {
                            case 0:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'SUNDAY_OPEN' })
                                break
                            case 1:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'MONDAY_OPEN' })
                                break
                            case 2:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'TUESDAY_OPEN' })
                                break
                            case 3:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'WEDNESDAY_OPEN' })
                                break
                            case 4:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'THURSDAY_OPEN' })
                                break
                            case 5:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'FRIDAY_OPEN' })
                                break
                            case 6:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'SATURDAY_OPEN' })
                                break
                        }
                        if (libraryOpenTime.option === 'null') return res.json({ 'error': 'Cannot issue high demand book, library is closed tomorrow.' })
                        else dueDate = tomorrow.setSeconds(parseInt(libraryOpenTime.option) + 1800)
                    }

                    if (bookReserved !== null) {
                        bookReserved.status = 'archive'
                        bookReserved.save().catch(err => console.log(err))

                        for (let j = 0; j < book.copies.length; j++) {
                            if (book.reservation[j].userid.toString() === this._id.toString()) {
                                for (let i = 0; i < book.copies.length; i++) {
                                    if (book.copies[i].availability === 'onhold') {
                                        book.noOfBooksOnLoan = book.noOfBooksOnLoan + 1
                                        book.copies[i].availability = 'onloan'
                                        book.copies[i].borrower = {
                                            userid: this._id,
                                            borrowAt: Date(),
                                            dueDate,
                                            renews: 0
                                        }
                                        book.reservation.splice(j, 1)
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
                                break
                            }
                            else res.json({ 'error': 'There are other users infront of the queue.' })
                        }
                    }
                    else {
                        if (book.copies.length > book.noOfBooksOnLoan)
                            for (let i = 0; i < book.copies.length; i++) {
                                if (book.copies[i].availability === 'available') {
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
                    }
                })
        }
    }
}

librarianSchema.methods.addBook = async function (book, res) {
    const { location, campus, isbn, noOfCopies } = book

    const googleBookAPI = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)

    if (googleBookAPI.data.totalItems === 0) res.status(404).json({ 'error': 'Book not found.' })
    else {
        Book.findOne({ isbn })
            .then(book => {
                const { title, authors, publisher, publishedDate, categories, description, pageCount, imageLinks } = googleBookAPI.data.items[0].volumeInfo
                if (book === null) {
                    let image = imageLinks.thumbnail
                    let secureImg = image.replace('http:', 'https:')

                    const newBook = new Book({
                        title,
                        author: authors,
                        isbn,
                        publisher,
                        publishedDate,
                        categories,
                        description,
                        noOfPages: pageCount,
                        thumbnail: secureImg,
                        location,
                        campus,
                        copies: []
                    })
                    for (let i = 0; i < noOfCopies; i++)
                        newBook.copies.push({})
                    newBook.save()
                        .then(() => res.status(201).json({ 'title': title }))
                        .catch(err => res.json({ 'error': err.message }))
                }
                else {
                    for (let i = 0; i < noOfCopies; i++)
                        book.copies.push({})
                    book.save()
                        .then(() => res.status(201).json({ 'title': title }))
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
            const { location, campus, isbn, noOfCopies } = book

            const googleBookAPI = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)

            if (googleBookAPI.data.totalItems === 0) {
                fail.push(isbn + ' - Invalid ISBN')
            }
            else {
                await Book.findOne({ isbn })
                    .then(async (book) => {
                        const { title, authors, publisher, publishedDate, categories, description, pageCount, imageLinks } = googleBookAPI.data.items[0].volumeInfo
                        if (book === null) {
                            let image = imageLinks.thumbnail
                            let secureImg = image.replace('http:', 'https:')

                            const newBook = new Book({
                                title,
                                author: authors,
                                isbn,
                                publisher,
                                publishedDate,
                                categories,
                                description,
                                noOfPages: pageCount,
                                thumbnail: secureImg,
                                location,
                                campus,
                                copies: []
                            })
                            for (let i = 0; i < noOfCopies; i++)
                                newBook.copies.push({})
                            newBook.save()
                                .then(() => success.push(`${title} (${isbn})`))
                                .catch(err => fail.push(`${title} (${isbn}) - ${err.message}`))
                        }
                        else {
                            for (let i = 0; i < noOfCopies; i++)
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
                res.status(201).json({
                    success,
                    fail
                })
            }, 1000)
        })
}

librarianSchema.methods.editBook = function (bookDetails, res) {
    const { isbn } = bookDetails

    Book.findOne({ isbn })
        .then(book => {
            if (book === null) return res.sendStatus(404)
            else {
                const { title, publisher, publishedDate, description, noOfPages, location, campus } = bookDetails
                const author = bookDetails.author.split(',').map(item => {
                    return item.trim()
                })
                const categories = bookDetails.categories.split(',').map(item => {
                    return item.trim()
                })

                book.title = title
                book.publisher = publisher
                book.publishedDate = publishedDate
                book.description = description
                book.noOfPages = noOfPages
                book.location = location
                book.campus = campus
                book.author = author
                book.categories = categories

                book.save().then(() => res.sendStatus(200))
            }
        })
        .catch(err => console.log(err))
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
                                book.copies[i].availability = 'onhold'
                                for (let j = 0; j < book.reservation.length; j++) {
                                    if (book.reservation[j].expireAt === null) {
                                        book.reservation[j] = {
                                            ...book.reservation[j],
                                            expireAt: new Date(new Date().getTime() + (parseInt(timeOnHold.option) * 1000))
                                        }
                                        Reserve.findOne({ _id: borrow.bookid, userid: book.reservation[0].userid, status: 'active' })
                                            .then(reserve => {
                                                reserve.expireAt = new Date(new Date().getTime() + (parseInt(timeOnHold.option) * 1000))

                                                reserve.save().catch(err => console.log(err))
                                            })
                                        break
                                        // TODO: Inform next member in reservation queue
                                    }
                                }
                            }
                            else {
                                book.copies[i].availability = 'available'
                                book.copies[i].borrower = null
                                book.noOfBooksOnLoan = book.noOfBooksOnLoan - 1
                                break
                            }
                        }
                    }
                    book.save().then(() => res.sendStatus(200)).catch(err => console.log)
                })
        })
}

librarianSchema.methods.getOverdueBooks = function (res) {
    const now = new Date(new Date().toDateString())

    Borrow.find({ status: 'active', dueDate: { $lt: now } })
        .populate({ path: 'userid', select: 'userid', populate: { path: 'udmid', select: 'email' } })
        .populate('bookid', ['title', 'isbn'])
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

librarianSchema.methods.getDueBooks = function (from, to, res) {
    const now = new Date(new Date(from).toDateString())
    const toDate = new Date(new Date(to).toDateString())
    toDate.setDate(toDate.getDate() + 1)

    Borrow.find({ status: 'active', dueDate: { $gte: now, $lt: toDate } })
        .populate({ path: 'userid', select: 'userid', populate: { path: 'udmid', select: 'email' } })
        .populate('bookid', ['title', 'isbn'])
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

librarianSchema.methods.getReservations = function (res) {
    Reserve.find({ status: 'active', expireAt: { $ne: null } })
        .populate({ path: 'userid', select: 'userid', populate: { path: 'udmid', select: 'email' } })
        .populate('bookid', ['title', 'isbn', 'isHighDemand'])
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

librarianSchema.methods.issueBook = async function (bookid, userid, res) {
    const book = await Book.findById(bookid)

    if (book.isHighDemand === true) {
        let today = new Date()
        today.setHours(0, 0, 0, 0)
        const dayOfWeek = today.getDay()

        let libraryCloseTime

        switch (dayOfWeek) {
            case 0:
                libraryCloseTime = await Setting.findOne({ 'setting': 'SUNDAY_CLOSE' })
                break
            case 1:
                libraryCloseTime = await Setting.findOne({ 'setting': 'MONDAY_CLOSE' })
                break
            case 2:
                libraryCloseTime = await Setting.findOne({ 'setting': 'TUESDAY_CLOSE' })
                break
            case 3:
                libraryCloseTime = await Setting.findOne({ 'setting': 'WEDNESDAY_CLOSE' })
                break
            case 4:
                libraryCloseTime = await Setting.findOne({ 'setting': 'THURSDAY_CLOSE' })
                break
            case 5:
                libraryCloseTime = await Setting.findOne({ 'setting': 'FRIDAY_CLOSE' })
                break
            case 6:
                libraryCloseTime = await Setting.findOne({ 'setting': 'SATURDAY_CLOSE' })
                break
        }
        if (libraryCloseTime.option == 'null') return res.json({ 'error': 'Cannot issue book, library is closed' })
        else {
            today.setSeconds(parseInt(libraryCloseTime.option) - 1800)
            if (today > new Date()) return res.json({ 'error': `Cannot issue high demand book, too early. ${today}` })
        }
    }

    User.findById(userid)
        .then(user => {
            user.borrow(bookid, res)
        })
        .catch(err => console.log(err))
}

librarianSchema.methods.removeBook = function (bookCopies, res) {
    const { copies } = bookCopies
    let count = 0
    Book.findOne({ isbn: bookCopies.isbn })
        .then(book => {

            for (let i = 0; i < copies.length; i++) {
                if (!copies[i].checked)
                    continue
                for (let j = 0; j < book.copies.length; j++) {
                    if (copies[i]._id === book.copies[j]._id.toString()) {
                        book.copies.splice(j, 1)
                        book.removed.push({
                            _id: copies[i]._id,
                            reason: copies[i].reason,
                            createdAt: Date()
                        })
                        count++
                    }
                }
            }

            book.save()
                .then(() => {
                    res.json({ 'noOfBooksRemoved': count })
                })
                .catch(err => console.log(err))
        })
}

librarianSchema.methods.notify = async function (books, type, res) {
    let emailSent = []

    for (let i = 0; i < books.length; i++) {
        if (books[i].checked) {
            const mailRegister = {
                from: 'no-reply@udmlibrary.com',
                to: books[i].email,
                subject: type === 'overdue' ? 'NOTIFY: Book overdue' : 'NOTIFY: Book due',
                text: `Your book titled ${books[i].title} with ISBN ${books[i].isbn} is overdue since ${books[i].dueDate}`
            }
            try {
                await transporter.sendMail(mailRegister)
                emailSent.push(books[i].userid)
            }
            catch (err) {
                console.log(err.message)
            }
        }
    }
    if (emailSent.length === 0) res.status(400).json({ 'error': 'Zero notification sent, no user(s) selected.' })
    else res.json({ 'listOfEmailSent': emailSent })
}

const Librarian = User.discriminator('Librarian', librarianSchema)

module.exports = Librarian