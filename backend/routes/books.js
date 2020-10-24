const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const multer = require('multer')
const upload = multer({ dest: 'uploads/books/' })
const csv = require('csv-parser')
const fs = require('fs');
const Book = require('../models/book.model')
const Borrow = require('../models/transactions/borrow.model')
const secret = process.env.JWT_SECRET;

// Add a single book
router.post('/add_single', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)

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
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)

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

router.post('/borrow/:id', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    let numOfBooks = null
    let copyid = null
    let bookid = null

    await Borrow.countDocuments({ userid: '5f8ed838f6ffb3226c2589ef', archive: false })
        .then(count => {
            numOfBooks = count
        })
        .catch(err => res.json({ success: 'false', err }))

    console.log(numOfBooks)

    await Book.findById("5f92dc3e0d03481c48f9e267")
        .then(book => {
            for (let i = 0; i < book.copies.length; i++) {
                if (book.copies[i].availability === 'available') {
                    console.log('available')
                    bookid = book._id
                    copyid = book.copies[i]._id
                    book.copies[i].availability = 'onloan'
                    book.save()
                    break
                }
            }
        })
        .catch(err => res.json({ success: 'false', err }))

    console.log(copyid)

    if (copyid === null) {
        return res.sendStatus(400)
    }

    const trans = new Borrow({
        userid: "5f8ed838f6ffb3226c2589ef",
        bookid,
        copyid,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    trans.save().then(() => res.json('success'))
})

router.get('/', (req, res) => {
    Book.find()
        .then(books => res.json({
            'success': true,
            books
        }))
        .catch(err => res.status(400).json({
            'success': false,
            'error': err.message
        }))
})

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