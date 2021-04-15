const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const mongoose = require('mongoose')
const multer = require('multer')
const upload = multer({ dest: 'uploads/books/' })
const Book = require('../models/book.model')
const Borrow = require('../models/transactions/borrow.model')
const Reserve = require('../models/transactions/reserve.model')
const Transaction = require('../models/transactions/transaction.base')
const User = require('../models/users/user.base')
const Member = require('../models/users/member.model')
const MemberA = require('../models/users/member_academic.model')
const MemberNA = require('../models/users/member_non_academic.model')
const Librarian = require('../models/users/librarian.model')
const Admin = require('../models/users/admin.model')
const Request = require('../models/request.model')
const escapeRegExp = require('../function/escapeRegExp')
const axios = require('axios')
const secret = process.env.JWT_SECRET

// Add a single book to the database
// It can validate using GoogleAPI or not use GoogleAPI
router.post('/add_single', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    const { title, authors, isbn, publisher, publishedDate, category, description, noOfPages, location, campus, noOfCopies } = req.body
    // Check if requires API validation
    const APIValidation = req.body.APIValidation === 'true'

    // Check if user is a librarian
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (APIValidation) {
        // Validate user inputs for api validation
        if (!location || !campus || !isbn || !noOfCopies || !category) return res.status(400).json({
            error: 'msgMissingParams'
        })
    }
    else if (!APIValidation) {
        // Validate user inputs for maunal adding of book
        if (!title || !authors || !isbn || !publisher || !publishedDate || !category ||
            !description || !noOfPages || !location || !campus || !noOfCopies) return res.status(400).json({
                error: 'msgMissingParams'
            })
    }
    // If everything is good, call function addBook from librarian model
    Librarian.findById(req.user._id)
        .then(librarian => {
            librarian.addBook(req.body, APIValidation, res)
        })
})

// Add multiple book from csv file
router.post('/add', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), upload.single('csv'), (req, res) => {
    // Check if account is a librarian
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        // Call addBookCSV function from librarian model
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.addBookCSV(req.file.path, res)
            })
    }
})

// Edit book details
router.put('/edit', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    // Check if isbn is supplied
    else if (!req.body.isbn) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        // Call edit book function
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.editBook(req.body, res)
            })
    }
})

// Reserve a book
router.post('/reserve/:bookid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findById(req.user._id)
        .then(user => {
            user.reserveBook(req.params.bookid, res)
        })
})

// Cancel a book reservation
router.patch('/cancel_reservation/:bookid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findById(req.user._id)
        .then(user => {
            user.cancelReservation(req.params.bookid, res)
        })
})

// Renew a borrowed book
router.post('/renew/:borrowid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findById(req.user._id)
        .then(user => {
            user.renewBook(req.params.borrowid, res)
        })
})

// Return a borrowed book
router.post('/return_book', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (!req.body.userid || !req.body.isbn || !req.body.campus) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.returnBook(req.body.isbn, req.body.userid, req.body.campus, res)
            })
    }
})

// Get all reserved books for a user
router.get('/reserved', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findById(req.user._id)
        .then(user => {
            user.getReservedBooks(res)
        })
})

// Get all borrowed books for a user
router.get('/borrowed', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findById(req.user._id)
        .then(user => {
            user.getBorrowedBooks(res)
        })
})

// Issue book
router.post('/issue', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType != 'Librarian') return res.sendStatus(403)
    else if (!req.body.isbn || !req.body.userid || !req.body.campus) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.issueBook(req.body.isbn, req.body.userid, req.body.campus, res)
            })
    }
})

// Search book
router.post('/search', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (!req.body.search) return res.json({ 'error': 'Empty search query' })
    else {
        // Create a regex to do fuzzy search
        const regex = new RegExp(escapeRegExp(req.body.search), 'gi')
        if (!req.body.category || req.body.category === 'All')
            Book.find({ [req.body.searchType]: regex, 'copies.0': { $exists: true } })
                .sort({ 'title': 1 })
                .then(books => res.json(books))
        else
            Book.find({ [req.body.searchType]: regex, category: req.body.category, 'copies.0': { $exists: true } })
                .sort({ 'title': 1 })
                .then(books => res.json(books))
    }
})

// Get list of books overdue books
router.get('/overdue', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.getOverdueBooks(res)
            })
            .catch(err => console.log(err))
    }
})

// Get transactions report within date range
router.post('/transactionsreport', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (!req.body.from || !req.body.to) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.getTransactionsReport(req.body.from, req.body.to, res)
            })
            .catch(err => console.log(err))
    }
})

// Get payment report within date range
router.post('/paymentssreport', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (!req.body.from || !req.body.to) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.getPaymentsReport(req.body.from, req.body.to, res)
            })
            .catch(err => console.log(err))
    }
})

// Get book reports within date range
router.post('/booksreport', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (!req.body.from || !req.body.to) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.getBooksReport(req.body.from, req.body.to, res)
            })
            .catch(err => console.log(err))
    }
})

// Get list of books due
router.post('/due', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (!req.body.from || !req.body.to) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.getDueBooks(req.body.from, req.body.to, res)
            })
            .catch(err => console.log(err))
    }
})

// Get list of book reservations
router.get('/reservation', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.getReservations(res)
            })
            .catch(err => console.log(err))
    }
})

// Remove book
router.post('/remove', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (!req.body.copies || !req.body.isbn) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.removeBook(req.body, res)
            })
    }
})

// Get list of books
router.get('/', (req, res) => {
    Book.find({ 'copies.0': { $exists: true } })
        .sort({ 'title': 1 })
        .then(books => res.json({
            books
        }))
        .catch(err => console.log(err))
})

// Get list of requested books by academic staffs
router.get('/request', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        // Get their faculty, first name and last name
        Request.find()
            .populate({ path: 'userid', select: 'userid', populate: { path: 'udmid', select: ['faculty', 'firstName', 'lastName'] } })
            .then(requests => res.json(requests))
            .catch(err => console.log(err))
    }
})

// Remove requested book
router.delete('/request/:id', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        Request.findByIdAndDelete(req.params.id)
            .then(request => {
                if (request)
                    res.json({
                        message: 'msgRequestDeleteSuccess',
                        request
                    })
                else
                    res.json({
                        error: 'msgRequest404'
                    })
            })
            .catch(err => console.log(err))
    }
})

// Request a book for academic staff
router.post('/request', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'MemberA') return res.sendStatus(403)
    else if (!req.body.isbn) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        MemberA.findById(req.user._id)
            .then(user => user.requestBook(req.body.isbn, res))
            .catch(err => console.log(err))
    }
})

// Get list of recommended books
router.get('/recommended', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    axios.get(`http://localhost:42069/recommend/${req.user._id}`)
        .then(response => {
            Book.find().where('isbn').in(response.data)
                .select(['title', 'isbn', 'thumbnail', 'publisher', 'publishedDate', 'campus'])
                .then(books => res.json(books.reverse()))
        })
        .catch(() => res.json([]))
})

// Get an individual book by id
router.get('/:id', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    // Check if the id supplied is a valid ObjectID from mongoose
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.sendStatus(404)
    else {
        Book.findById(req.params.id)
            .then(async book => {
                // Book not found
                if (!book) return res.sendStatus(404)
                else {
                    let response = {
                        book
                    }
                    if (req.user) {
                        // Find if this user has a transaction with that particular book
                        const transaction = await Transaction.findOne({ userid: req.user._id, bookid: req.params.id, status: 'active' })

                        if (transaction !== null) {
                            response = {
                                ...response,
                                transaction: transaction.transactionType
                            }

                            if (transaction.transactionType === 'Reserve') {
                                let position

                                // Find the position in reservation queue if user has a reservation
                                for (let i = 0; i < book.reservation.length; i++) {
                                    if (req.user._id === String(book.reservation[i].userid)) {
                                        position = i + 1
                                        break
                                    }
                                }

                                response = {
                                    ...response,
                                    position
                                }
                            }
                        }
                    }
                    // Send response to the client
                    res.json(response)
                }
            })
            .catch(err => console.log(err))
    }

})

module.exports = router