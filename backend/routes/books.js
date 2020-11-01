const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const multer = require('multer')
const upload = multer({ dest: 'uploads/books/' })
const csv = require('csv-parser')
const fs = require('fs');
const Book = require('../models/book.model')
const Borrow = require('../models/transactions/borrow.model')
const Reserve = require('../models/transactions/reserve.model')
const Transaction = require('../models/transactions/transaction.base');
const Member = require('../models/users/member.model');
const MemberA = require('../models/users/member_accademic.model');
const MemberNA = require('../models/users/member_non_accademic.model');
const secret = process.env.JWT_SECRET;

// Add a single book
router.post('/add_single', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    // if (req.user.memberType !== 'Librarian') return res.sendStatus(403)

    const { title, author, isbn, publisher, publishedDate, edition, category, description, noOfPages, location, campus, purchasedOn } = req.body

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
                    copies: {
                        purchasedOn
                    }
                })
                newBook.save()
                    .then(() => res.sendStatus(201))
                    .catch(err => res.status(400).json({
                        'success': false,
                        'error': err.message
                    }))
            }
            else {
                book.copies.push({
                    purchasedOn
                })
                book.save()
                    .then(() => res.sendStatus(200))
                    .catch(err => res.status(400).json({
                        'success': false,
                        'error': err.message
                    }))
            }
        })
        .catch(err => res.status(400).json({
            'success': false,
            'error': err.message
        }))
})

// Add multiple book from csv file
router.post('/add', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), upload.single('csv'), (req, res) => {
    // if (req.user.memberType !== 'Librarian') return res.sendStatus(403)

    let success = []
    let fail = []

    const stream = fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', async (book) => {
            stream.pause()
            const { title, author, isbn, publisher, publishedDate, edition, category, description, noOfPages, location, campus, purchasedOn } = book

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
                            copies: {
                                purchasedOn
                            }
                        })
                        newBook.save()
                            .then(() => success.push(title))
                            .catch(() => fail.push(title))
                    }
                    else {
                        book.copies.push({
                            purchasedOn
                        })
                        await book.save()
                            .then(() => success.push(title))
                            .catch(() => fail.push(title))
                    }
                })
                .catch(err => {
                    return res.status(400).json({
                        'error': err.message
                    })
                })
            stream.resume()
        })
        .on('end', () => {
            setTimeout(() => {
                res.json({
                    success,
                    fail
                })
            }, 500);
        })
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
    Transaction.findOne({ bookid: req.params.bookid, userid: req.user._id, archive: false })
        .then(book => {
            if (book === null) {

                Book.findById(req.params.bookid)
                    .then(book => {
                        for (let i = 0; i < book.copies.length; i++) {
                            if (book.copies[i].availability === 'available') {
                                return res.json({ err: 'Book is available cannot reserve' })
                            }
                        }

                        book.reservation.push({
                            userid: req.user._id,
                            reservedAt: Date()
                        })

                        book.save().catch(err => console.log(err))

                        const newReservation = new Reserve({
                            userid: req.user._id,
                            bookid: req.params.bookid
                        })

                        newReservation.save().then(res.sendStatus(201)).catch(err => console.log(err))
                    })
                    .catch(err => console.log(err))
            }
            else {
                if (book.transactionType === 'Reserve') return res.json({ err: 'Book already reserved' })
                else return res.json({ err: 'Book already borrowed' })
            }
        })
        .catch(err => console.log(err))
})

router.patch('/cancel_reservation/:reservationid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {

    Reserve.findByIdAndUpdate(req.params.reservationid, { isCancel: true, archive: true })
        .then((reserve) => {
            Book.findOne({ _id: reserve.bookid })
                .then(book => {
                    for (let i = 0; i < book.reservation.length; i++) {
                        if (book.reservation[i].userid == req.user._id) {
                            book.reservation.splice(i, 1)
                            break
                        }
                    }
                    book.save().then(() => res.sendStatus(200)).catch(err => console.log(err))
                })
        })
        .catch(err => console.log(err))
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