const { CronJob } = require('cron')
const User = require('../models/users/user.base')
const Book = require('../models/book.model')
const Reserve = require('../models/transactions/reserve.model')
const Setting = require('../models/setting.model')
const transporter = require('../config/mail.config')
const sendSMS = require('../function/sendSMS')
const checkHolidays = require('../function/checkHolidays')

// This function will check every 15 minutes if a reservation expired
// It will will then mark it as expired, then notify the next reservation in queue if any
const expireReservations = new CronJob('*/15 * * * *', () => {
    const now = new Date()

    // Finds all reservation that are expired
    Reserve.find({ status: 'active', expireAt: { $lt: now } })
        .populate({ path: 'userid', select: 'userid', populate: { path: 'udmid', select: ['email', 'phone'] } })
        .populate('bookid', ['title'])
        .then(reserves => {
            // Loop through the araray of expired reservation, mark them as expired and save to database
            for (let i = 0; i < reserves.length; i++) {
                reserves[i].status = 'expired'
                reserves[i].save().catch(err => console.log(err))

                const mailRegister = {
                    from: 'no-reply@udmlibrary.com',
                    to: reserves[i].userid.udmid.email,
                    subject: 'Book reservation expired',
                    text: `Your reservation for book titled ${reserves[i].bookid.title} has expired.`
                }

                // Send email notification
                transporter.sendMail(mailRegister, (err, info) => {
                    if (err) return res.status(500).json({ error: 'msgUnexpectedError' })
                })

                // Send SMS nofitication
                sendSMS(`Your reservation for book titled ${reserves[i].bookid.title} has expired.`, `+230${reserves[i].userid.udmid.phone}`)
            }
        })


    Book.find({ 'reservation.expireAt': { $lt: now } })
        .then(async books => {
            if (books.length !== 0) {
                for (let i = 0; i < books.length; i++) {
                    let count = 0
                    let copiesCount = 0

                    while (true) {
                        if (books[i].reservation.length > 0) {
                            if (books[i].reservation[0].expireAt !== null) {
                                if (books[i].reservation[0].expireAt < now) {
                                    books[i].reservation.splice(0, 1)
                                    books[i].noOfBooksOnHold--
                                    count++
                                }
                            }
                            else break
                        }
                        else break
                    }

                    for (let j = 0; j < books[i].copies.length; j++) {
                        if (count === copiesCount) break
                        else if (books[i].copies[j].availability === 'onhold') {
                            books[i].copies[j].availability = 'available'
                            copiesCount++
                        }
                    }

                    // -----------------------------------------------------------------------------

                    if (books[i].reservation.length - books[i].noOfBooksOnHold > 0) {
                        const freeCopies = books[i].reservation.length - book[i].noOfBooksOnHold
                        const reserveCount = books[i].reservation.length
                        let highest
                        if (freeCopies > reserveCount) highest = reserveCount
                        else highest = freeCopies

                        const bookSettings = await Setting.findOne({ setting: 'BOOK' })
                        const timeOnHold = bookSettings.options.time_onhold.value

                        for (let k = 0; k < highest; k++) {
                            let expireDate = new Date(new Date().getTime() + (timeOnHold * 1000))

                            expireDate = await checkHolidays(expireDate)

                            books[i].reservation[k].expireAt = expireDate

                            Reserve.findOne({ bookid: books[i]._id, userid: books[i].reservation[k].userid, expireAt: null, status: 'active' })
                                .then(reserve => {
                                    if (reserve) {
                                        reserve.expireAt = expireDate
                                        reserve.save().catch(err => console.log(err))
                                    }
                                })

                            User.findById(books[i].reservation[k].userid)
                                .populate('udmid', ['email', 'phone'])
                                .then(user => {
                                    const mailRegister = {
                                        from: 'no-reply@udmlibrary.com',
                                        to: user.udmid.email,
                                        subject: 'Reserved book available',
                                        text: `Your reservation for book titled ${books[i].title} is now available.`
                                    }

                                    transporter.sendMail(mailRegister, (err, info) => {
                                        if (err) return res.status(500).json({ error: 'msgUnexpectedError' })
                                    })

                                    sendSMS(`Your reservation for book titled ${books[i].title} is now available.`, `+230${user.udmid.phone}`)
                                })
                        }

                        let onHoldCount = 0
                        for (let l = 0; l < books[i].copies.length; l++) {
                            if (highest === onHoldCount) break
                            else if (books[i].copies[l].availability === 'available') {
                                books[i].copies[l].availability = 'onhold'
                                books[i].noOfBooksOnHold++
                                onHoldCount++
                            }
                        }
                    }

                    books[i].save()
                }
            }
        })
}, null, true, 'Indian/Mauritius')

module.exports = expireReservations

