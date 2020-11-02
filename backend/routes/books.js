const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const multer = require('multer')
const upload = multer({ dest: 'uploads/books/' })
const Book = require('../models/book.model')
const Borrow = require('../models/transactions/borrow.model')
const Reserve = require('../models/transactions/reserve.model')
const Transaction = require('../models/transactions/transaction.base')
const User = require('../models/users/user.base')
const Member = require('../models/users/member.model')
const MemberA = require('../models/users/member_accademic.model')
const MemberNA = require('../models/users/member_non_accademic.model')
const Librarian = require('../models/users/librarian.model')
const Admin = require('../models/users/admin.model')
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

// Borrow a book
router.post('/borrow/:bookid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {

    if (req.user.memberType === 'Member') {
        Member.findOne({ _id: req.user._id })
            .then(member => {
                member.borrow(req.params.bookid, res)
            })
    }
    else if (req.user.memberType === 'MemberA') {
        MemberA.findOne({ _id: req.user._id })
            .then(member => {
                member.borrow(req.params.bookid, res)
            })
    }
    else if (req.user.memberType === 'MemberNA') {
        MemberNA.findOne({ _id: req.user._id })
            .then(member => {
                member.borrow(req.params.bookid, res)
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
router.patch('/cancel_reservation/:reservationid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            user.cancelReservation(req.params.reservationid, res)
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
router.post('/return_book/:borrowid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        Librarian.findOne({ _id: req.user._id })
            .then(librarian => {
                librarian.returnBook(req.params.borrowid, res)
            })
    }
})

router.get('/reserved', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            user.getReservedBooks(res)
        })
})

router.get('/borrowed', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            user.getBorrowedBooks(res)
        })
})

// Get list of books
router.get('/', (req, res) => {
    Book.find().populate('copies.borrower.userid', { userid: 1 })
        .then(books => res.json({
            'success': true,
            books
        }))
        .catch(err => res.status(400).json({
            'success': false,
            'error': err.message
        }))
})

// Get an individual book by id
router.get('/:id', (req, res) => {
    Book.findById(req.params.id)
        .then(book => res.json({
            'success': true,
            book
        }))
        .catch(err => res.status(400).json({
            'success': false,
            'error': err.message
        }))
})

module.exports = router