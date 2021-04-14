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
const checkHolidays = require('../../function/checkHolidays')
const borrowBook = require('../../function/borrowBook')
const sendSMS = require('../../function/sendSMS')

const Schema = mongoose.Schema

const librarianSchema = new Schema()

librarianSchema.methods.borrow = async function (bookid, libraryOpenTime, res) {
    const bookBorrowed = await Borrow.findOne({ bookid, userid: this._id, status: 'active' })

    // If already borrowed same book, return error
    if (bookBorrowed !== null) return res.status(400).json({ error: 'msgBorrowMultiple' })
    else {
        // Get number of books borrowed this month and get book limit from settings
        const date = new Date()
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        const numOfBooksBorrowed = await Borrow.countDocuments({ userid: this._id, createdAt: { $gte: firstDay, $lte: lastDay } })
        const userSettings = await Setting.findOne({ setting: 'USER' })
        const bookLimit = userSettings.options.non_academic_borrow.value

        // Check if book limit reached return error
        if (numOfBooksBorrowed >= bookLimit) return res.status(400).json({
            error: 'msgBorrowLibrarianLimit',
            limit: bookLimit
        })
        else
            borrowBook(this._id, bookid, libraryOpenTime, res)
    }
}

librarianSchema.methods.addBook = async function (book, APIValidation, res) {
    // Get list of locations and categories from database
    let pamLocation = await Setting.findOne({ 'setting': 'PAM_LOCATIONS' }).select('options')
    let rhillLocation = await Setting.findOne({ 'setting': 'RHILL_LOCATIONS' }).select('options')
    let categories = await Setting.findOne({ 'setting': 'CATEGORIES' }).select('options')

    pamLocation = pamLocation.options
    rhillLocation = rhillLocation.options
    categories = categories.options

    let { isbn, category, campus, location, noOfCopies } = book

    let googleBookAPI

    // Validate user inputs
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
        // Check if book is found on GoogleAPI
        googleBookAPI = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
        if (googleBookAPI.data.totalItems === 0) return res.status(404).json({ error: 'msgGoogleAPI404' })
    }
    Book.findOne({ isbn })
        .then(result => {
            // Trim user input
            isbn = isbn.trim()
            category = category.trim()
            campus = campus.trim()
            location = location.trim()

            // If book is not already in database
            if (!result) {
                let image, secureImg

                if (APIValidation) {
                    try {
                        // Get thumbnail from GoogleAPI
                        image = googleBookAPI.data.items[0].volumeInfo.imageLinks.thumbnail
                        secureImg = image.replace('http:', 'https:')
                    }
                    catch (e) {
                        // Catch undefined error
                        return res.status(400).json({ error: 'msgThumbnail404' })
                    }
                }

                // Create a new book
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
                // Add number of copies the librarian specified
                for (let i = 0; i < noOfCopies; i++)
                    newBook.copies.push({})

                // Save the book to database
                // Catch error if some params are missing from GoogleAPI
                try {
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
                catch (e) {
                    res.status(400).json({ error: 'msgGoogleAPI404Params' })
                }
            }
            // If book is already in database, add copies
            // save to database and send response
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
    // Get list of locations and categories from database
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

                // Validate user inputs
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
                    // Trim user inputs
                    isbn = isbn.trim()
                    category = category.trim()
                    campus = campus.trim()
                    location = location.trim()

                    Book.findOne({ isbn })
                        .then(async (book) => {
                            if (!book) {
                                // Try catch any error caused by GoogleAPI missing params
                                try {
                                    const { title, authors, publisher, publishedDate, description, pageCount, imageLinks } = googleBookAPI.data.items[0].volumeInfo
                                    let image = imageLinks.thumbnail
                                    let secureImg = image.replace('http:', 'https:')

                                    // Create new book and add number of copies specified in csv file
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
                                catch (e) {
                                    resolve(fail.push(`Row ${count}: ${isbn} - Missing params in GoogleAPI`))
                                }
                            }
                            // Book already available in database, add copies
                            // save to database
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
            // After all data is processed sort success and fail array and response to client
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
    // Get list of locations and categories from database
    let pamLocation = await Setting.findOne({ 'setting': 'PAM_LOCATIONS' }).select('options')
    let rhillLocation = await Setting.findOne({ 'setting': 'RHILL_LOCATIONS' }).select('options')
    let categories = await Setting.findOne({ 'setting': 'CATEGORIES' }).select('options')

    pamLocation = pamLocation.options
    rhillLocation = rhillLocation.options
    categories = categories.options

    const { isbn } = bookDetails

    // Find book in database
    Book.findOne({ isbn })
        .then(book => {
            // Book not found
            if (!book) return res.sendStatus(404)
            else {
                const { title, publisher, publishedDate, description, noOfPages, location, campus, category } = bookDetails
                const author = bookDetails.author.split(',').map(item => {
                    return item.trim()
                })

                // Validate campus, location and category
                if (campus !== 'pam' && campus !== 'rhill')
                    return res.status(404).json({ error: 'msgInvalidCampus' })
                else if (!pamLocation.includes(location) && !rhillLocation.includes(location))
                    return res.status(404).json({ error: 'msgInvalidLocation' })
                else if (!categories.includes(category))
                    return res.status(404).json({ error: 'msgInvalidCategory' })

                // Update book details
                book.title = title
                book.publisher = publisher
                book.publishedDate = publishedDate
                book.description = description
                book.noOfPages = noOfPages
                book.location = location
                book.campus = campus
                book.author = author
                book.category = category

                // Save book to database and send response
                try {
                    book.save().then(() => res.json({ message: 'msgEditBookSuccess' }))
                }
                catch (err) {
                    res.status(400).json({ error: 'msgMissingParams' })
                }
            }
        })
        .catch(err => console.log(err))
}

librarianSchema.methods.returnBook = async function (isbn, userid, campus, res) {
    // Get opening and closing hours of the library from database
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

    // Calculate opening and closing hours
    const openTime = new Date(today.getTime() + (libraryOpenTime * 1000))
    const closeTime = new Date(today.getTime() + (libraryCloseTime * 1000))

    // Check if library is closed or not
    if (libraryOpenTime === 0 && libraryCloseTime === 0) return res.status(400).json({ error: 'msgLibraryClosed' })
    else if (new Date() <= openTime || new Date() >= closeTime) return res.status(400).json({ error: 'msgLibraryClosed' })
    else {
        User.findOne({ userid })
            .then(user => {
                // Find user
                if (user) {
                    Book.findOne({ isbn })
                        // Find book
                        .then(async book => {
                            if (book) {
                                // Find borrow transaction
                                Borrow.findOne({ bookid: book._id, userid: user._id, status: 'active' })
                                    .then(async borrow => {
                                        if (borrow) {
                                            // Validates the campus of the book
                                            if (book.campus === campus) {
                                                // Get fine per day from database
                                                const bookSettings = await Setting.findOne({ setting: 'BOOK' })
                                                let numOfDays
                                                const finePerDay = bookSettings.options.fine_per_day.value
                                                const timeOnHold = bookSettings.options.time_onhold.value
                                                let payment

                                                // Set returned date in database and mark transaction as archive
                                                borrow.returnedOn = Date()
                                                borrow.status = 'archive'

                                                const now = new Date(new Date().toDateString())
                                                const borrowDate = new Date(borrow.dueDate.toDateString())
                                                numOfDays = ((now.getTime() - borrowDate.getTime()) / (24 * 60 * 60 * 1000))

                                                // Calculate fine for high demand
                                                if (borrow.isHighDemand) {
                                                    if (new Date() > new Date(borrow.dueDate))
                                                        numOfDays++
                                                }

                                                // If book is overdue, create a payment record
                                                if (numOfDays > 0) {

                                                    const newPayment = new Payment({
                                                        borrowid: borrow_id,
                                                        userid: borrow.userid,
                                                        bookid: borrow.bookid,
                                                        copyid: borrow.copyid,
                                                        numOfDays,
                                                        pricePerDay: finePerDay
                                                    })

                                                    payment = await newPayment.save().catch(err => console.log(err))

                                                    payment = await payment
                                                        .populate('borrowid')
                                                        .populate('userid', ['userid'])
                                                        .populate('bookid', ['title', 'isbn'])
                                                        .execPopulate()
                                                }
                                                borrow.save().catch(err => console.log(err))

                                                book.noOfBooksOnLoan--
                                                for (let i = 0; i < book.copies.length; i++) {
                                                    if (book.copies[i].borrower.userid) {
                                                        if (book.copies[i].borrower.userid.toString() === borrow.userid.toString()) {
                                                            // If book has reservation
                                                            // mark book as onhold, inform next member in queue and set expiry date
                                                            if (book.reservation.length - book.noOfBooksOnHold > 0) {
                                                                book.copies[i].availability = 'onhold'
                                                                book.copies[i].borrower = null
                                                                book.noOfBooksOnHold++
                                                                for (let j = 0; j < book.reservation.length; j++) {
                                                                    if (book.reservation[j].expireAt === null) {
                                                                        let dueDate = new Date(new Date().getTime() + (timeOnHold * 1000))
                                                                        // Check if due date is a public holiday or Sunday
                                                                        dueDate = await checkHolidays(dueDate)

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

                                                                                        // Send email notification
                                                                                        transporter.sendMail(mailNotification, (err, info) => {
                                                                                            if (err) return res.status(500).json({ error: 'msgUserRegistrationUnexpectedError' })
                                                                                        })

                                                                                        // Send SMS notification
                                                                                        sendSMS(`Your reservation for book titled ${book.title} is now available.`,
                                                                                            `+230${user.udmid.phone}`)
                                                                                    })
                                                                            })
                                                                        break
                                                                    }
                                                                }
                                                            }
                                                            // If there no is reservation, mark book as available
                                                            else {
                                                                book.copies[i].availability = 'available'
                                                                book.copies[i].borrower = null
                                                                break
                                                            }
                                                        }
                                                    }
                                                }

                                                // Save book to database and send response
                                                book.save()
                                                    .then(() => {
                                                        res.json({
                                                            title: book.title,
                                                            noOfDaysOverdue: numOfDays,
                                                            finePerDay,
                                                            payment: payment ? payment : null,
                                                            borrowid: borrow._id
                                                        })
                                                    })
                                                    .catch(err => console.log(err))
                                            }
                                            else
                                                // Returning book to the wrong campus
                                                res.status(400).json({ error: 'msgReturnWrongCampus' })
                                        }
                                        else
                                            // Borrow record not found
                                            res.status(404).json({ error: 'msgReturn404' })
                                    })
                                    .catch(err => console.log(err))
                            }
                            else
                                // Book not found
                                res.status(404).json({ error: 'msgReturnBook404' })
                        })
                        .catch(err => console.log(err))
                }
                else
                    // Member not found
                    res.status(404).json({ error: 'msgReturnMember404' })
            })
    }

}

librarianSchema.methods.getOverdueBooks = function (res) {
    // Get list of overdue books
    const now = new Date(new Date().toDateString())

    Borrow.find({ status: 'active', dueDate: { $lt: now } })
        .populate({ path: 'userid', select: 'userid', populate: { path: 'udmid', select: ['email', 'phone'] } })
        .populate('bookid', ['title', 'isbn', 'isHighDemand'])
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

librarianSchema.methods.getDueBooks = function (from, to, res) {
    // Get list of due books within a range
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
    // Get list of reservations that needs to be issue in the next 2 days
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)

    Reserve.find({ status: 'active', expireAt: { $ne: null, $gt: now, $lt: tomorrow } })
        .populate('userid', ['userid'])
        .populate('bookid', ['title', 'isbn', 'isHighDemand'])
        .then(books => res.json(books))
        .catch(err => console.log(err))
}

librarianSchema.methods.issueBook = async function (isbn, userid, campus, res) {
    // Get book info
    const book = await Book.findOne({ isbn }).select(['_id', 'isHighDemand', 'campus'])

    // Get opening and closing hours from database
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

    const tomorrowOpenTime = openSettings.options[dayOfWeek === 6 ? 0 : dayOfWeek + 1].time

    // Set opening and closing hours
    const openTime = new Date(today.getTime() + (libraryOpenTime * 1000))
    const closeTime = new Date(today.getTime() + (libraryCloseTime * 1000))

    // Verify if the library is closed
    if (libraryOpenTime === 0 && libraryCloseTime === 0) return res.status(400).json({ error: 'msgLibraryClosed' })
    else if (new Date() <= openTime || new Date() >= closeTime) return res.status(400).json({ error: 'msgLibraryClosed' })
    else {
        User.findOne({ userid })
            .then(user => {
                if (!user)
                    // User not found
                    res.status(404).json({ error: 'msgIssueMember404' })
                else
                    if (book) {
                        if (book.campus === campus) {
                            // If book is high demand, check if it is in time range to issue book
                            if (book.isHighDemand) {
                                today.setSeconds(libraryCloseTime - 1800)
                                if (today > new Date()) return res.status(400).json({ error: 'msgIssueHighDemand' })
                            }
                            // Call borrow function
                            user.borrow(book._id, tomorrowOpenTime, res)
                        }
                        else
                            // Wrong campus selected
                            res.status(400).json({ error: 'msgIssueWrongCampus' })
                    }
                    else
                        // Book not found
                        res.status(404).json({ error: 'msgIssueBook404' })
            })
            .catch(err => console.log(err))

    }
}

librarianSchema.methods.removeBook = function (bookCopies, res) {
    const { copies } = bookCopies
    let count = 0
    // Remove book copies and insert the reason they were removed
    Book.findOne({ isbn: bookCopies.isbn })
        .then(book => {

            // Find the copy selected and remove from copies array and add them to the removed array
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

            // Saved to database and send response
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

    for (let i = 0; i < books.length; i++) {
        if (books[i].checked) {
            const mailRegister = {
                from: 'no-reply@udmlibrary.com',
                to: books[i].email,
                subject: type === 'overdue' ? 'NOTIFY: Book overdue' : 'NOTIFY: Book due',
                text: type === 'overdue' ? `Your book titled ${books[i].title} with ISBN ${books[i].isbn} is due since ${books[i].dueDate}` : `Your book titled ${books[i].title} with ISBN ${books[i].isbn} is due on ${books[i].dueDate}`
            }

            // Send SMS notification
            sendSMS(type === 'overdue' ? `Your book titled ${books[i].title} with ISBN ${books[i].isbn} is due since ${books[i].dueDate}` : `Your book titled ${books[i].title} with ISBN ${books[i].isbn} is due on ${books[i].dueDate}`,
                `+230${books[i].phone}`)

            try {
                // Send email notification
                await transporter.sendMail(mailRegister)
                emailSent.push(books[i].userid)
            }
            catch (err) {
                console.log(err.message)
            }
        }
    }
    // Send response
    if (emailSent.length === 0) res.status(400).json({ error: 'msgNotifyNoUsers' })
    else res.json({
        message: 'msgNotifySuccess',
        users: emailSent
    })
}

librarianSchema.methods.getTransactionsReport = function (from, to, res) {
    // Get all transactions within the range
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
    // Get all payment records within the range
    const fromDate = new Date(new Date(from).toDateString())
    const toDate = new Date(new Date(to).toDateString())
    toDate.setDate(toDate.getDate() + 1)

    Payment.find({ createdAt: { $gte: fromDate, $lt: toDate } })
        .populate('borrowid', ['createdAt', 'returnedOn', 'dueDate'])
        .populate('userid', ['userid'])
        .populate('bookid', ['title', 'isbn'])
        .sort({ createdAt: 1 })
        .then(payments => {
            res.json(payments)
        })
        .catch(err => console.log(err))
}

librarianSchema.methods.getBooksReport = function (from, to, res) {
    // Get all book records within the range
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