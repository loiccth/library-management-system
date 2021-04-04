const mongoose = require('mongoose')
const axios = require('axios')
const User = require('./user.base')
const Book = require('../book.model')
const Transaction = require('../transactions/transaction.base')
const Borrow = require('../transactions/borrow.model')
const Reserve = require('../transactions/reserve.model')
const Payment = require('../payment.model')
const Setting = require('../setting.model')
const csv = require('csv-parser')
const fs = require('fs')
const transporter = require('../../config/mail.config')
const twilio = require('twilio')

const Schema = mongoose.Schema

const librarianSchema = new Schema()

librarianSchema.methods.borrow = async function (bookid, libraryOpenTime, res) {
    const bookBorrowed = await Borrow.findOne({ bookid, userid: this._id, status: 'active' })

    if (bookBorrowed !== null) return res.status(400).json({ error: 'msgBorrowMultiple' })
    else {
        const date = new Date()
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        const numOfBooksBorrowed = await Borrow.countDocuments({ userid: this._id, createdAt: { $gte: firstDay, $lte: lastDay } })
        const userSettings = await Setting.findOne({ setting: 'USER' })
        const bookLimit = userSettings.options.non_academic_borrow.value

        if (numOfBooksBorrowed >= bookLimit) return res.status(400).json({
            error: 'msgBorrowLibrarianLimit',
            limit: bookLimit
        })
        else {

            const numOfHighDemandBooksBorrowed = await Borrow.countDocuments({ userid: this._id, status: 'active', isHighDemand: true })

            if (numOfHighDemandBooksBorrowed <= 0) {
                const now = new Date()
                const bookReserved = await Reserve.findOne({ bookid, userid: this._id, status: 'active', expireAt: { $gte: now } })

                Book.findById(bookid)
                    .then(async book => {
                        let dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        if (book.isHighDemand === true) {
                            const tomorrow = new Date()
                            tomorrow.setDate(tomorrow.getDate() + 2)
                            tomorrow.setHours(0, 0, 0, 0)

                            if (libraryOpenTime === 0) return res.status(400).json({ error: 'msgBorrowHighDemand' })
                            else dueDate = tomorrow.setSeconds(libraryOpenTime + 1800)
                        }

                        if (bookReserved !== null) {
                            bookReserved.status = 'archive'
                            bookReserved.save().catch(err => console.log(err))

                            for (let j = 0; j < book.reservation.length; j++) {
                                if (book.reservation[j].userid.toString() === this._id.toString()) {
                                    for (let i = 0; i < book.copies.length; i++) {
                                        if (book.copies[i].availability === 'onhold') {
                                            book.noOfBooksOnLoan++
                                            book.noOfBooksOnHold++
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
                                                return res.status(201).json({
                                                    message: 'msgBorrowSuccess',
                                                    title: book.title,
                                                    dueDate: new Date(dueDate),
                                                    reservationid: bookReserved._id
                                                })
                                            }).catch(err => console.log(err))
                                            break
                                        }
                                    }
                                    break
                                }
                                else res.status(400).json({ error: 'msgBorrowQueue' })
                            }
                        }
                        else {
                            if (book.copies.length > book.noOfBooksOnLoan + book.noOfBooksOnHold)
                                for (let i = 0; i < book.copies.length; i++) {
                                    if (book.copies[i].availability === 'available') {
                                        book.noOfBooksOnLoan++
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
                                            return res.status(201).json({
                                                message: 'msgBorrowSuccess',
                                                title: book.title,
                                                dueDate: new Date(dueDate)
                                            })
                                        }).catch(err => console.log(err))
                                        break
                                    }
                                }
                            else
                                res.status(400).json({ error: 'msgBorrowNotAvailable' })
                        }
                    })
            }
            else
                res.status(400).json({ error: 'msgBorrowMoreHighDemand' })
        }
    }
}

librarianSchema.methods.addBook = async function (book, APIValidation, res) {
    let pamLocation = await Setting.findOne({ 'setting': 'PAM_LOCATIONS' }).select('options')
    let rhillLocation = await Setting.findOne({ 'setting': 'RHILL_LOCATIONS' }).select('options')
    let categories = await Setting.findOne({ 'setting': 'CATEGORIES' }).select('options')

    pamLocation = pamLocation.options
    rhillLocation = rhillLocation.options
    categories = categories.options

    let { isbn, category, campus, location, noOfCopies } = book

    let googleBookAPI

    if (isbn.length !== 10 && isbn.length !== 13)
        return res.status(400).json({ error: 'msgInvalidISBNLength' })
    else if (campus !== 'pam' && campus !== 'rhill')
        return res.status(400).json({ error: 'msgInvalidCampus' })
    else if (!pamLocation.includes(location) && !rhillLocation.includes(location))
        return res.status(400).json({ error: 'msgInvalidLocation' })
    else if (!categories.includes(category))
        return res.status(400).json({ error: 'msgInvalidCategory' })
    else if (noOfCopies < 1)
        return res.status(400).json({ error: 'msgInvalidCopies' })
    else if (APIValidation) {
        googleBookAPI = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
        if (googleBookAPI.data.totalItems === 0) return res.status(404).json({ error: 'msgGoogleAPI404' })
    }
    Book.findOne({ isbn })
        .then(result => {
            isbn = isbn.trim()
            category = category.trim()
            campus = campus.trim()
            location = location.trim()
            noOfCopies = noOfCopies.trim()

            if (!result) {
                let image, secureImg

                if (APIValidation) {
                    image = googleBookAPI.data.items[0].volumeInfo.imageLinks.thumbnail
                    secureImg = image.replace('http:', 'https:')
                }

                const newBook = new Book({
                    title: APIValidation ? googleBookAPI.data.items[0].volumeInfo.title : book.title,
                    author: APIValidation ? googleBookAPI.data.items[0].volumeInfo.authors : book.authors,
                    isbn,
                    publisher: APIValidation ? googleBookAPI.data.items[0].volumeInfo.publisher : book.publisher,
                    publishedDate: APIValidation ? googleBookAPI.data.items[0].volumeInfo.publishedDate : book.publishedDate,
                    category,
                    description: APIValidation ? googleBookAPI.data.items[0].volumeInfo.description : book.description,
                    noOfPages: APIValidation ? googleBookAPI.data.items[0].volumeInfo.pageCount : book.noOfPages,
                    thumbnail: APIValidation ? secureImg : null,
                    location,
                    campus,
                    copies: []
                })
                for (let i = 0; i < noOfCopies; i++)
                    newBook.copies.push({})
                newBook.save()
                    .then(() => res.status(201).json({
                        message: 'msgBookAddSuccess',
                        title: APIValidation ? title : book.title
                    }))
                    .catch(err => {
                        res.json({
                            error: 'msgUnexpectedError'
                        })
                        console.log(err)
                    })
            }
            else {
                for (let i = 0; i < noOfCopies; i++)
                    result.copies.push({})
                result.save()
                    .then(() => res.status(201).json({
                        message: 'msgBookAddSuccess',
                        title: result.title
                    }))
                    .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
}

librarianSchema.methods.addBookCSV = async function (file, res) {
    let pamLocation = await Setting.findOne({ 'setting': 'PAM_LOCATIONS' }).select('options')
    let rhillLocation = await Setting.findOne({ 'setting': 'RHILL_LOCATIONS' }).select('options')
    let categories = await Setting.findOne({ 'setting': 'CATEGORIES' }).select('options')

    pamLocation = pamLocation.options
    rhillLocation = rhillLocation.options
    categories = categories.options

    let success = []
    let fail = []
    let promises = []
    let temp = 2

    fs.createReadStream(file)
        .pipe(csv())
        .on('data', (book, count = (function () {
            return temp
        })()) => {
            promises.push(new Promise(async (resolve) => {
                let { isbn, category, campus, location, noOfCopies } = book

                const googleBookAPI = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)

                if (!isbn || (isbn.length !== 10 && isbn.length !== 13))
                    resolve(fail.push(`Row ${count}: ${isbn} - Invalid ISBN`))
                else if (!campus || (campus !== 'pam' && campus !== 'rhill'))
                    resolve(fail.push(`Row ${count}: ${isbn} - Invalid campus`))
                else if (!location || (!pamLocation.includes(location) && !rhillLocation.includes(location)))
                    resolve(fail.push(`Row ${count}: ${isbn} - Invalid location`))
                else if (!category || (!categories.includes(category)))
                    resolve(fail.push(`Row ${count}: ${isbn} - Invalid category`))
                else if (!noOfCopies || noOfCopies < 1)
                    resolve(fail.push(`Row ${count}: ${isbn} - Invalid number of copies`))
                else if (googleBookAPI.data.totalItems === 0)
                    resolve(fail.push(`Row ${count}: ${isbn} - Invalid ISBN`))
                else {
                    isbn = isbn.trim()
                    category = category.trim()
                    campus = campus.trim()
                    location = location.trim()
                    noOfCopies = noOfCopies.trim()

                    await Book.findOne({ isbn })
                        .then(async (book) => {
                            const { title, authors, publisher, publishedDate, description, pageCount, imageLinks } = googleBookAPI.data.items[0].volumeInfo
                            if (book === null) {
                                let image = imageLinks.thumbnail
                                let secureImg = image.replace('http:', 'https:')

                                const newBook = new Book({
                                    title,
                                    author: authors,
                                    isbn,
                                    publisher,
                                    publishedDate,
                                    category,
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
                                    .then(() => resolve(success.push(`Row ${count}: ${isbn} - ${title}`)))
                                    .catch(err => resolve(fail.push(`Row ${count}: ${isbn} - ${err.message}`)))
                            }
                            else {
                                for (let i = 0; i < noOfCopies; i++)
                                    book.copies.push({})
                                await book.save()
                                    .then(() => resolve(success.push(`Row ${count}: ${isbn} - ${title}`)))
                                    .catch(err => resolve(fail.push(`Row ${count}: ${isbn} - ${err.message}`)))
                            }
                        })
                        .catch(err => console.log(err))
                }
            }))
            temp++
        })
        .on('end', () => {
            Promise.all(promises)
                .then(() => {

                    success.sort()
                    fail.sort()

                    res.status(201).json({
                        success,
                        fail
                    })
                })
        })
}

librarianSchema.methods.editBook = async function (bookDetails, res) {
    let pamLocation = await Setting.findOne({ 'setting': 'PAM_LOCATIONS' }).select('options')
    let rhillLocation = await Setting.findOne({ 'setting': 'RHILL_LOCATIONS' }).select('options')
    let categories = await Setting.findOne({ 'setting': 'CATEGORIES' }).select('options')

    pamLocation = pamLocation.options
    rhillLocation = rhillLocation.options
    categories = categories.options

    const { isbn } = bookDetails

    Book.findOne({ isbn })
        .then(book => {
            if (book === null) return res.sendStatus(404)
            else {
                const { title, publisher, publishedDate, description, noOfPages, location, campus, category } = bookDetails
                const author = bookDetails.author.split(',').map(item => {
                    return item.trim()
                })

                if (campus !== 'pam' && campus !== 'rhill')
                    return res.status(404).json({ error: 'msgInvalidCampus' })
                else if (!pamLocation.includes(location) && !rhillLocation.includes(location))
                    return res.status(404).json({ error: 'msgInvalidLocation' })
                else if (!categories.includes(category))
                    return res.status(404).json({ error: 'msgInvalidCategory' })

                book.title = title
                book.publisher = publisher
                book.publishedDate = publishedDate
                book.description = description
                book.noOfPages = noOfPages
                book.location = location
                book.campus = campus
                book.author = author
                book.category = category

                book.save().then(() => res.json({ message: 'msgEditBookSuccess' }))
            }
        })
        .catch(err => console.log(err))
}

librarianSchema.methods.returnBook = async function (isbn, userid, campus, res) {
    let today = new Date()
    today.setHours(0, 0, 0, 0)
    let dayOfWeek = today.getDay()
    const closeSettings = await Setting.findOne({ setting: 'CLOSING_HOURS' })
    const openSettings = await Setting.findOne({ setting: 'OPENING_HOURS' })

    if (dayOfWeek === 0)
        dayOfWeek = 6
    else
        dayOfWeek -= 1

    const libraryOpenTime = openSettings.options[dayOfWeek].time
    const libraryCloseTime = closeSettings.options[dayOfWeek].time

    const openTime = new Date(today.getTime() + (libraryOpenTime * 1000))
    const closeTime = new Date(today.getTime() + (libraryCloseTime * 1000))

    if (libraryOpenTime === 0 && libraryCloseTime === 0) return res.status(400).json({ error: 'msgLibraryClosed' })
    else if (new Date() <= openTime || new Date() >= closeTime) return res.status(400).json({ error: 'msgLibraryClosed' })
    else {
        User.findOne({ userid })
            .then(user => {
                if (user) {
                    Book.findOne({ isbn })
                        .then(async book => {
                            if (book) {
                                Borrow.findOne({ bookid: book._id, userid: user._id, status: 'active' })
                                    .then(async borrow => {
                                        if (borrow) {
                                            if (book.campus === campus) {
                                                const bookSettings = await Setting.findOne({ setting: 'BOOK' })
                                                let numOfDays
                                                const finePerDay = bookSettings.options.fine_per_day.value
                                                const timeOnHold = bookSettings.options.time_onhold.value
                                                let payment

                                                borrow.returnedOn = Date()
                                                borrow.status = 'archive'

                                                const now = new Date(new Date().toDateString())
                                                const borrowDate = new Date(borrow.dueDate.toDateString())
                                                numOfDays = ((now.getTime() - borrowDate.getTime()) / (24 * 60 * 60 * 1000))

                                                if (borrow.isHighDemand) {
                                                    if (new Date() > new Date(borrow.dueDate))
                                                        numOfDays++
                                                }

                                                if (numOfDays > 0) {

                                                    const newPayment = new Payment({
                                                        userid: borrow.userid,
                                                        bookid: borrow.bookid,
                                                        copyid: borrow.copyid,
                                                        numOfDays,
                                                        pricePerDay: finePerDay
                                                    })

                                                    payment = await newPayment.save().catch(err => console.log(err))

                                                    payment = await payment
                                                        .populate('userid', ['userid'])
                                                        .populate('bookid', ['title', 'isbn'])
                                                        .execPopulate()
                                                }
                                                borrow.save().catch(err => console.log(err))

                                                book.noOfBooksOnLoan--
                                                for (let i = 0; i < book.copies.length; i++) {
                                                    if (book.copies[i].borrower.userid) {
                                                        if (book.copies[i].borrower.userid.toString() === borrow.userid.toString()) {
                                                            if (book.reservation.length - book.noOfBooksOnHold > 0) {
                                                                book.copies[i].availability = 'onhold'
                                                                book.copies[i].borrower = null
                                                                book.noOfBooksOnHold++
                                                                for (let j = 0; j < book.reservation.length; j++) {
                                                                    if (book.reservation[j].expireAt === null) {
                                                                        const dueDate = new Date(new Date().getTime() + (timeOnHold * 1000))
                                                                        book.reservation[j].expireAt = dueDate
                                                                        Reserve.findOne({ bookid: borrow.bookid, userid: book.reservation[j].userid, status: 'active' })
                                                                            .then(reserve => {
                                                                                reserve.expireAt = dueDate

                                                                                reserve.save().catch(err => console.log(err))

                                                                                User.findById(reserve.userid)
                                                                                    .populate('udmid', ['email', 'phone'])
                                                                                    .then(user => {
                                                                                        const mailNotification = {
                                                                                            from: 'no-reply@udmlibrary.com',
                                                                                            to: user.udmid.email,
                                                                                            subject: 'Book available',
                                                                                            text: `Your reservation for book titled ${book.title} is now available.`
                                                                                        }

                                                                                        transporter.sendMail(mailNotification, (err, info) => {
                                                                                            if (err) return res.status(500).json({ error: 'msgUserRegistrationUnexpectedError' })
                                                                                        })

                                                                                        const accountSid = process.env.TWILIO_SID
                                                                                        const authToken = process.env.TWILIO_AUTH

                                                                                        const client = new twilio(accountSid, authToken)

                                                                                        client.messages.create({
                                                                                            body: `Your reservation for book titled ${book.title} is now available.`,
                                                                                            to: `+230${user.udmid.phone}`,
                                                                                            from: process.env.TWILIO_PHONE
                                                                                        })
                                                                                            .catch(err => {
                                                                                                console.log(err)
                                                                                            })
                                                                                    })
                                                                            })
                                                                        break
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                book.copies[i].availability = 'available'
                                                                book.copies[i].borrower = null
                                                                break
                                                            }
                                                        }
                                                    }
                                                }

                                                book.save()
                                                    .then(() => {
                                                        res.json({
                                                            noOfDaysOverdue: numOfDays,
                                                            finePerDay,
                                                            payment: payment ? payment : null,
                                                            borrowid: borrow._id
                                                        })
                                                    })
                                                    .catch(err => console.log(err))
                                            }
                                            else
                                                res.status(400).json({ error: 'msgReturnWrongCampus' })
                                        }
                                        else
                                            res.status(404).json({ error: 'msgReturn404' })
                                    })
                                    .catch(err => console.log(err))
                            }
                            else
                                res.status(404).json({ error: 'msgReturnBook404' })
                        })
                        .catch(err => console.log(err))
                }
                else
                    res.status(404).json({ error: 'msgReturnMember404' })
            })
    }

}

librarianSchema.methods.getOverdueBooks = function (res) {
    const now = new Date(new Date().toDateString())

    Borrow.find({ status: 'active', dueDate: { $lt: now } })
        .populate({ path: 'userid', select: 'userid', populate: { path: 'udmid', select: ['email', 'phone'] } })
        .populate('bookid', ['title', 'isbn', 'isHighDemand'])
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

librarianSchema.methods.getDueBooks = function (from, to, res) {
    const fromDate = new Date(new Date(from).toDateString())
    const toDate = new Date(new Date(to).toDateString())
    toDate.setDate(toDate.getDate() + 1)

    Borrow.find({ status: 'active', dueDate: { $gte: fromDate, $lt: toDate } })
        .populate({ path: 'userid', select: 'userid', populate: { path: 'udmid', select: ['email', 'phone'] } })
        .populate('bookid', ['title', 'isbn', 'isHighDemand'])
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

librarianSchema.methods.getReservations = function (res) {
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)

    Reserve.find({ status: 'active', expireAt: { $ne: null, $gt: now, $lt: tomorrow } })
        .populate('userid', ['userid'])
        .populate('bookid', ['title', 'isbn', 'isHighDemand'])
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

librarianSchema.methods.issueBook = async function (isbn, userid, campus, res) {
    const book = await Book.findOne({ isbn }).select(['_id', 'isHighDemand', 'campus'])

    let today = new Date()
    today.setHours(0, 0, 0, 0)
    let dayOfWeek = today.getDay()
    const closeSettings = await Setting.findOne({ setting: 'CLOSING_HOURS' })
    const openSettings = await Setting.findOne({ setting: 'OPENING_HOURS' })

    if (dayOfWeek === 0)
        dayOfWeek = 6
    else
        dayOfWeek -= 1

    const libraryOpenTime = openSettings.options[dayOfWeek].time
    const libraryCloseTime = closeSettings.options[dayOfWeek].time

    const openTime = new Date(today.getTime() + (libraryOpenTime * 1000))
    const closeTime = new Date(today.getTime() + (libraryCloseTime * 1000))

    if (libraryOpenTime === 0 && libraryCloseTime === 0) return res.status(400).json({ error: 'msgLibraryClosed' })
    else if (new Date() <= openTime || new Date() >= closeTime) return res.status(400).json({ error: 'msgLibraryClosed' })
    else {
        User.findOne({ userid })
            .then(user => {
                if (!user)
                    res.status(404).json({ error: 'msgIssueMember404' })
                else
                    if (book) {
                        if (book.campus === campus) {
                            if (book.isHighDemand) {
                                today.setSeconds(libraryCloseTime - 1800)
                                if (today > new Date()) return res.status(400).json({ error: 'msgIssueHighDemand' })
                            }
                            user.borrow(book._id, libraryOpenTime, res)
                        }
                        else
                            res.status(400).json({ error: 'msgIssueWrongCampus' })
                    }
                    else
                        res.status(404).json({ error: 'msgIssueBook404' })
            })
            .catch(err => console.log(err))

    }
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
                    res.json({
                        message: 'msgCopiesRemove',
                        amount: count
                    })
                })
                .catch(err => console.log(err))
        })
}

librarianSchema.methods.notify = async function (books, type, res) {
    let emailSent = []

    console.log(books)

    for (let i = 0; i < books.length; i++) {
        if (books[i].checked) {
            const mailRegister = {
                from: 'no-reply@udmlibrary.com',
                to: books[i].email,
                subject: type === 'overdue' ? 'NOTIFY: Book overdue' : 'NOTIFY: Book due',
                text: type === 'overdue' ? `Your book titled ${books[i].title} with ISBN ${books[i].isbn} is due since ${books[i].dueDate}` : `Your book titled ${books[i].title} with ISBN ${books[i].isbn} is due on ${books[i].dueDate}`
            }

            const accountSid = process.env.TWILIO_SID
            const authToken = process.env.TWILIO_AUTH

            const client = new twilio(accountSid, authToken)

            client.messages.create({
                body: type === 'overdue' ? `Your book titled ${books[i].title} with ISBN ${books[i].isbn} is due since ${books[i].dueDate}` : `Your book titled ${books[i].title} with ISBN ${books[i].isbn} is due on ${books[i].dueDate}`,
                to: `+230${books[i].phone}`,
                from: process.env.TWILIO_PHONE
            })
                .catch(err => {
                    console.log(err)
                })

            try {
                await transporter.sendMail(mailRegister)
                emailSent.push(books[i].userid)
            }
            catch (err) {
                console.log(err.message)
            }
        }
    }
    if (emailSent.length === 0) res.status(400).json({ error: 'msgNotifyNoUsers' })
    else res.json({
        message: 'msgNotifySuccess',
        users: emailSent
    })
}

librarianSchema.methods.getTransactionsReport = function (from, to, res) {
    const fromDate = new Date(new Date(from).toDateString())
    const toDate = new Date(new Date(to).toDateString())
    toDate.setDate(toDate.getDate() + 1)

    Transaction.find({ createdAt: { $gte: fromDate, $lt: toDate } })
        .populate('userid', ['userid'])
        .populate('bookid', ['title', 'isbn'])
        .sort({ createdAt: 1 })
        .then(transactions => {
            res.json(transactions)
        })
        .catch(err => console.log(err))
}

librarianSchema.methods.getPaymentsReport = function (from, to, res) {
    const fromDate = new Date(new Date(from).toDateString())
    const toDate = new Date(new Date(to).toDateString())
    toDate.setDate(toDate.getDate() + 1)

    Payment.find({ createdAt: { $gte: fromDate, $lt: toDate } })
        .populate('userid', ['userid'])
        .populate('bookid', ['title', 'isbn'])
        .sort({ createdAt: 1 })
        .then(payments => {
            res.json(payments)
        })
        .catch(err => console.log(err))
}

librarianSchema.methods.getBooksReport = function (from, to, res) {
    const fromDate = new Date(new Date(from).toDateString())
    const toDate = new Date(new Date(to).toDateString())
    toDate.setDate(toDate.getDate() + 1)

    Book.find({ createdAt: { $gte: fromDate, $lt: toDate } })
        .sort({ createdAt: 1 })
        .then(books => {
            res.json(books)
        })
        .catch(err => console.log(err))
}

const Librarian = User.discriminator('Librarian', librarianSchema)

module.exports = Librarian