const Book = require('../models/book.model')
const Reserve = require('../models/transactions/reserve.model')
const Borrow = require('../models/transactions/borrow.model')
const checkDate = require('./checkDate')
const checkHolidays = require('./checkHolidays')
const transporter = require('../config/mail.config')
const sendSMS = require('../function/sendSMS')

const borrowBook = async (userid, email, phone, bookid, libraryOpenTime, res, academic = false) => {
    // Get reservation of the book
    const bookReserved = await Reserve.findOne({ bookid, userid, status: 'active', expireAt: { $gte: new Date() } })

    Book.findById(bookid)
        .then(async book => {
            // Calculate due date
            let dueDate = academic === true ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            if (book.isHighDemand === true) {
                const numOfHighDemandBooksBorrowed = await Borrow.countDocuments({ userid, status: 'active', isHighDemand: true })
                // If book is high demand, verify if they already have a high demand book borrowed
                if (numOfHighDemandBooksBorrowed > 0) {
                    res.status(400).json({ error: 'msgBorrowMoreHighDemand' })
                }

                // Set due date for high demand books
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                tomorrow.setHours(0, 0, 0, 0)
                tomorrow.setSeconds(libraryOpenTime + 1800)

                // Check if tomorrow is a public holiday, library closed or Sunday
                if (libraryOpenTime === 0) return res.status(400).json({ error: 'msgBorrowHighDemand' })
                else if (checkDate(tomorrow) === true) return res.status(400).json({ error: 'msgLibraryClosedTomorrow' })
                else dueDate = tomorrow
            }
            else
                // Check if due date is a public holiday or Sunday
                dueDate = await checkHolidays(dueDate)

            if (bookReserved) {
                // Find reservation, mark it as archive and save to database
                bookReserved.status = 'archive'
                bookReserved.save().catch(err => console.log(err))

                // Find copy of the book that is linked to the reservation and mark is as onloan
                for (let j = 0; j < book.reservation.length; j++) {
                    if (book.reservation[j].userid.toString() === this._id.toString()) {
                        for (let i = 0; i < book.copies.length; i++) {
                            if (book.copies[i].availability === 'onhold') {
                                book.noOfBooksOnLoan++
                                book.noOfBooksOnHold--
                                book.copies[i].availability = 'onloan'
                                book.copies[i].borrower = {
                                    userid,
                                    borrowAt: Date(),
                                    dueDate,
                                    renews: 0
                                }
                                // Remove the reservation from the book and save to database
                                book.reservation.splice(j, 1)
                                book.save().catch(err => console.log(err))

                                // Create a new borrow record
                                const newBorrow = new Borrow({
                                    userid,
                                    bookid,
                                    copyid: book.copies[i]._id,
                                    dueDate,
                                    isHighDemand: book.isHighDemand
                                })

                                const mailRegister = {
                                    from: 'no-reply@udmlibrary.com',
                                    to: email,
                                    subject: 'Book issued',
                                    text: `Book titled ${book.title} issued to your account and is due on ${dueDate}.`
                                }

                                // Send email notification to the member
                                transporter.sendMail(mailRegister, (err, info) => {
                                    if (err) return res.status(500).json({ error: 'msgUnexpectedError' })
                                })

                                // Send SMS notification to the member
                                sendSMS(`Book titled ${book.title} issued to your account and is due on ${dueDate}.`, `+230${phone}`)

                                // Save the record and send response to the client
                                newBorrow.save().catch(err => console.log(err))
                                return res.status(201).json({
                                    message: 'msgBorrowSuccess',
                                    title: book.title,
                                    dueDate: dueDate,
                                    reservationid: bookReserved._id
                                })
                            }
                        }
                        break
                    }
                }

                return res.status(400).json({ error: 'msgBorrowQueue' })
            }
            // If there is no reservation, check if there are copies available
            else {
                if (book.copies.length > book.noOfBooksOnLoan + book.noOfBooksOnHold)
                    for (let i = 0; i < book.copies.length; i++) {
                        // Find a copy that is available and mark it as on loan
                        // and add the borrower's details
                        if (book.copies[i].availability === 'available') {
                            book.noOfBooksOnLoan++
                            book.copies[i].availability = 'onloan'
                            book.copies[i].borrower = {
                                userid,
                                borrowAt: Date(),
                                dueDate,
                                renews: 0
                            }
                            // Save book to database
                            book.save().catch(err => console.log(err))

                            // Create new borrow record, save to database and response to the client
                            const newBorrow = new Borrow({
                                userid,
                                bookid,
                                copyid: book.copies[i]._id,
                                dueDate,
                                isHighDemand: book.isHighDemand
                            })

                            const mailRegister = {
                                from: 'no-reply@udmlibrary.com',
                                to: email,
                                subject: 'Book issued',
                                text: `Book titled ${book.title} issued to your account and is due on ${dueDate}.`
                            }

                            // Send email notification to the member
                            transporter.sendMail(mailRegister, (err, info) => {
                                if (err) return res.status(500).json({ error: 'msgUnexpectedError' })
                            })

                            // Send SMS notification to the member
                            sendSMS(`Book titled ${book.title} issued to your account and is due on ${dueDate}.`, `+230${phone}`)

                            newBorrow.save().catch(err => console.log(err))
                            return res.status(201).json({
                                message: 'msgBorrowSuccess',
                                title: book.title,
                                dueDate
                            })
                        }
                    }
                else
                    // No book available to borrow
                    res.status(400).json({ error: 'msgBorrowNotAvailable' })
            }
        })
}

module.exports = borrowBook