const { CronJob } = require('cron')
const Reserve = require('../models/transactions/reserve.model')
const Book = require('../models/book.model')
const Setting = require('../models/setting.model')

const expireReservations = new CronJob('*/5 * * * *', () => {
    Reserve.find({ status: 'active', expireAt: { $lt: Date() } })
        .then(reserves => {
            if (reserves.length !== 0) {
                for (let i = 0; i < reserves.length; i++) {
                    reserves[i].status = 'expired'
                    reserves[i].save().catch(err => { throw err })
                }
            }
            console.log(`Updated ${reserves.length} record(s)`)
        })

    const now = new Date()

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
                                    books[i].noOfBooksOnLoan--
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

                    if (books[i].copies.length > books[i].noOfBooksOnLoan) {
                        const freeCopies = books[i].copies.length - books[i].noOfBooksOnLoan
                        const reserveCount = books[i].reservation.length
                        let highest
                        if (freeCopies > reserveCount) highest = reserveCount
                        else highest = freeCopies

                        timeOnHold = await Setting.findOne({ setting: 'TIME_ON_HOLD' })

                        for (let k = 0; k < highest; k++) {
                            const expireDate = new Date(new Date().getTime() + (parseInt(timeOnHold.option) * 1000))
                            books[i].reservation[k].expireAt = expireDate

                            Reserve.findOne({ bookid: books[i]._id, userid: books[i].reservation[k].userid, expireAt: null })
                                .then(reserve => {
                                    reserve.expireAt = expireDate
                                    reserve.save().catch(err => console.log(err))
                                })

                            // TODO: inform user
                        }
                        let onHoldCount = 0
                        for (let l = 0; l < books[i].copies.length; l++) {
                            if (highest === onHoldCount) break
                            else if (books[i].copies[l].availability === 'available') {
                                books[i].copies[l].availability = 'onhold'
                                books[i].noOfBooksOnLoan++
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

