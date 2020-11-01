const mongoose = require('mongoose')
const User = require('./user.base')
const Book = require('../book.model')
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
                        copies: {
                            purchasedOn
                        }
                    })
                    newBook.save()
                        .then(() => res.sendStatus(201))
                        .catch(err => console.log(err))
                }
                else {
                    book.copies.push({
                        purchasedOn
                    })
                    book.save()
                        .then(() => res.sendStatus(201))
                        .catch(err => console.log(err))
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
                            .catch((err) => fail.push(title + ' - ' + err.message))
                    }
                    else {
                        book.copies.push({
                            purchasedOn
                        })
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

const Librarian = User.discriminator('Librarian', librarianSchema)

module.exports = Librarian