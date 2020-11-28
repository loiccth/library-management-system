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

// Borrow a book
// router.post('/borrow/:bookid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {

//     if (req.user.memberType === 'Member') {
//         Member.findOne({ _id: req.user._id })
//             .then(member => {
//                 member.borrow(req.params.bookid, res)
//             })
//     }
//     else if (req.user.memberType === 'MemberA') {
//         MemberA.findOne({ _id: req.user._id })
//             .then(member => {
//                 member.borrow(req.params.bookid, res)
//             })
//     }
//     else if (req.user.memberType === 'MemberNA') {
//         MemberNA.findOne({ _id: req.user._id })
//             .then(member => {
//                 member.borrow(req.params.bookid, res)
//             })
//     }
//     else if (req.user.memberType === 'Admin') {
//         Admin.findOne({ _id: req.user._id })
//             .then(member => {
//                 member.borrow(req.params.bookid, res)
//             })
//     }
//     else if (req.user.memberType === 'Librarian') {
//         Librarian.findOne({ _id: req.user._id })
//             .then(member => {
//                 member.borrow(req.params.bookid, res)
//             })
//     }
// })

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
    console.log(req.body.bookid)
    
    if (req.user.memberType != 'Librarian') return res.sendStatus(403)
    else if (req.body.bookid === undefined) return res.json({ 'error' : 'Missing book id'})
    else if (req.body.userid === undefined) return res.json({ 'error': 'Missing user id'})
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.issueBook(req.body.bookid, req.body.userid, res)
            })
    }
})

// Search book
router.post('/search', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.body.query === undefined) return res.json({ 'error': 'Empty search query' })
    else {
        const regex = new RegExp(escapeRegExp(req.body.query), 'gi')
        Book.find({ [req.body.searchType]: regex })
            .then(books => res.json(books))
    }
})

// Get list of books overdue book for today
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

// Get list of books due for today
router.get('/due', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        Librarian.findOne({ _id: req.user._id })
            .then(librarian => {
                librarian.getDueBooks(res)
            })
            .catch(err => console.log(err))
    }
})

// Get list of books
router.get('/', (req, res) => {
    Book.find().populate('copies.borrower.userid', { userid: 1 })
        .then(books => res.json({
            books
        }))
        .catch(err => console.log(err))
})

// Get an individual book by id
router.get('/:id', (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.sendStatus(404)
    else {
        Book.findById(req.params.id)
            .then(book => {
                if (book === null) return res.sendStatus(404)
                else {
                    res.json({
                        book
                    })
                }
            })
            .catch(err => console.log(err))
    }

})

module.exports = router