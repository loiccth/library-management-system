const { CronJob } = require('cron')
const Reserve = require('../models/transactions/reserve.model')
const Book = require('../models/book.model')
const Setting = require('../models/setting.model')
const User = require('../models/users/user.base')
const twilio = require('twilio')
const transporter = require('../config/mail.config')

const expireReservations = new CronJob('*/15 * * * *', () => {
    const now = new Date()

    Reserve.find({ status: 'active', expireAt: { $lt: now } })
        .populate({ path: 'userid', select: 'userid', populate: { path: 'udmid', select: ['email', 'phone'] } })
        .populate('bookid', ['title'])
        .then(reserves => {
            if (reserves.length !== 0) {
                for (let i = 0; i < reserves.length; i++) {
                    reserves[i].status = 'expired'
                    reserves[i].save().catch(err => { throw err })

                    const mailRegister = {
                        from: 'no-reply@udmlibrary.com',
                        to: reserves[i].userid.udmid.email,
                        subject: 'Account shutdown',
                        text: `Your reservation for book titled ${reserves[i].bookid.title} has expired.`
                    }

                    transporter.sendMail(mailRegister, (err, info) => {
                        if (err) return res.status(500).json({ error: 'msgUnexpectedError' })
                    })

                    const accountSid = process.env.TWILIO_SID
                    const authToken = process.env.TWILIO_AUTH

                    const client = new twilio(accountSid, authToken)

                    client.messages.create({
                        body: `Your reservation for book titled ${reserves[i].bookid.title} has expired.`,
                        to: `+230${reserves[i].userid.udmid.phone}`,
                        from: process.env.TWILIO_PHONE
                    })
                        .catch(err => {
                            console.log(err)
                        })
                }
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
                            const expireDate = new Date(new Date().getTime() + (timeOnHold * 1000))
                            books[i].reservation[k].expireAt = expireDate

                            Reserve.findOne({ bookid: books[i]._id, userid: books[i].reservation[k].userid, expireAt: null, status: 'active' })
                                .then(reserve => {
                                    reserve.expireAt = expireDate
                                    reserve.save().catch(err => console.log(err))
                                })

                            User.findById(books[i].reservation[k].userid)
                                .populate('udmid', ['email', 'phone'])
                                .then(user => {
                                    const mailRegister = {
                                        from: 'no-reply@udmlibrary.com',
                                        to: user.udmid.email,
                                        subject: 'Account shutdown',
                                        text: `Your reservation for book titled ${books[i].title} is now available.`
                                    }

                                    transporter.sendMail(mailRegister, (err, info) => {
                                        if (err) return res.status(500).json({ error: 'msgUnexpectedError' })
                                    })

                                    const accountSid = process.env.TWILIO_SID
                                    const authToken = process.env.TWILIO_AUTH

                                    const client = new twilio(accountSid, authToken)

                                    client.messages.create({
                                        body: `Your reservation for book titled ${books[i].title} is now available.`,
                                        to: `+230${user.udmid.phone}`,
                                        from: process.env.TWILIO_PHONE
                                    })
                                        .catch(err => {
                                            console.log(err)
                                        })
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

