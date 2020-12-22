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
const escapeRegExp = require('../function/escapeRegExp')
const secret = process.env.JWT_SECRET

// Add a single book
router.post('/add_single', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        Librarian.findOne({ _id: req.user._id })
            .then(librarian => {
                librarian.addBook(req.body, res)
            })
    }
})

// Add multiple book from csv file
router.post('/add', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), upload.single('csv'), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        Librarian.findOne({ _id: req.user._id })
            .then(librarian => {
                librarian.addBookCSV(req.file.path, res)
            })
    }
})

router.put('/edit', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (req.body.isbn === undefined || req.body.isbn === null) return res.status(400).json({ 'error': 'Missing params' })
    else {
        Librarian.findOne({ _id: req.user._id })
            .then(librarian => {
                librarian.editBook(req.body, res)
            })
    }
})

// Reserve a book
router.post('/reserve/:bookid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            user.reserveBook(req.params.bookid, res)
        })
})

// Cancel a book reservation
router.patch('/cancel_reservation/:bookid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            user.cancelReservation(req.params.bookid, res)
        })
})

// Renew a borrowed book
router.post('/renew/:borrowid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            user.renewBook(req.params.borrowid, res)
        })
})

// Return a borrowed book
router.post('/return_book', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (!req.body.userid || !req.body.isbn) return res.sendStatus(400)
    else {
        Librarian.findOne({ _id: req.user._id })
            .then(librarian => {
                librarian.returnBook(req.body.isbn, req.body.userid, res)
            })
    }
})

// Get all reserved books for a user
router.get('/reserved', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            user.getReservedBooks(res)
        })
})

// Get all borrowed books for a user
router.get('/borrowed', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            user.getBorrowedBooks(res)
        })
})

// Issue book
router.post('/issue', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType != 'Librarian') return res.sendStatus(403)
    else if (!req.body.isbn || !req.body.userid) return res.sendStatus(400)
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.issueBook(req.body.isbn, req.body.userid, res)
            })
    }
})

// Search book
router.post('/search', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.body.search === undefined) return res.json({ 'error': 'Empty search query' })
    else {
        const regex = new RegExp(escapeRegExp(req.body.search), 'gi')
        Book.find({ [req.body.searchType]: regex })
            .then(books => res.json(books))
    }
})

// Get list of books overdue books
router.get('/overdue', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        Librarian.findOne({ _id: req.user._id })
            .then(librarian => {
                librarian.getOverdueBooks(res)
            })
            .catch(err => console.log(err))
    }
})

// Get list of books due
router.post('/due', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (req.body.from === undefined || req.body.to === undefined) return res.status(400).json({ 'error': 'Missing date param.' })
    else {
        Librarian.findOne({ _id: req.user._id })
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
        Librarian.findOne({ _id: req.user._id })
            .then(librarian => {
                librarian.getReservations(res)
            })
            .catch(err => console.log(err))
    }
})

// Remove book
router.post('/remove', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (req.body.copies === undefined || req.body.copies === null) return res.status(400).json({ 'error': 'Missing copies params' })
    else if (req.body.isbn === undefined || req.body.isbn === null) return res.status(400).json({ 'error': 'Missing isbn params' })
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
        .then(books => res.json({
            books
        }))
        .catch(err => console.log(err))
})

// Get an individual book by id
router.get('/:id', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.sendStatus(404)
    else {
        Book.findById(req.params.id)
            .then(async book => {
                if (book === null) return res.sendStatus(404)
                else {
                    let response
                    response = {
                        book
                    }
                    if (req.user) {
                        const transaction = await Transaction.findOne({ userid: req.user._id, bookid: req.params.id, status: 'active' })

                        if (transaction !== null) {
                            response = {
                                ...response,
                                transaction: transaction.transactionType
                            }
                        }
                    }
                    res.json(response)
                }
            })
            .catch(err => console.log(err))
    }

})

module.exports = router