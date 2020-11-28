const mongoose = require('mongoose')
const User = require('./user.base')
const Borrow = require('../transactions/borrow.model')
const Reserve = require('../transactions/reserve.model')
const Book = require('../book.model')
const Setting = require('../setting.model')

const Schema = mongoose.Schema

const memberSchema = new Schema()

memberSchema.methods.borrow = async function (bookid, res) {
    const bookBorrowed = await Borrow.findOne({ bookid, userid: this._id, status: 'active' })
    if (bookBorrowed !== null) return res.json({ 'error': 'Cannot borrow multiple copies of the same book' })
    else {
        const numOfBooksBorrowed = await Borrow.countDocuments({ userid: this._id, status: 'active' })
        const bookLimit = await Setting.findOne({ setting: 'STUDENT_BORROW' })

        if (numOfBooksBorrowed >= parseInt(bookLimit.option)) return res.json({ 'error': 'Cannot borrow more than 2 books at the same time' })
        else {
            const now = new Date()
            const bookReserved = await Reserve.findOne({ bookid, userid: this._id, status: 'active', expireAt: { $gte: now } })

            Book.findOne({ _id: bookid })
                .then(async book => {
                    let dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    if (book.isHighDemand === true) {
                        const tomorrow = new Date()
                        tomorrow.setDate(tomorrow.getDate() + 2)
                        tomorrow.setHours(0, 0, 0, 0)

                        const dayOfWeek = tomorrow.getDay()
                        let libraryOpenTime
                        switch (dayOfWeek) {
                            case 0:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'SUNDAY_OPEN' })
                                break
                            case 1:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'MONDAY_OPEN' })
                                break
                            case 2:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'TUESDAY_OPEN' })
                                break
                            case 3:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'WEDNESDAY_OPEN' })
                                break
                            case 4:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'THURSDAY_OPEN' })
                                break
                            case 5:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'FRIDAY_OPEN' })
                                break
                            case 6:
                                libraryOpenTime = await Setting.findOne({ 'setting': 'SATURDAY_OPEN' })
                                break
                        }
                        if (libraryOpenTime.option === 'null') return res.json({ 'error': 'Cannot issue high demand book, library is closed tomorrow.' })
                        else dueDate = tomorrow.setSeconds(parseInt(libraryOpenTime.option) + 1800)
                    }

                    if (bookReserved !== null) {
                        bookReserved.status = 'archive'
                        bookReserved.save().catch(err => console.log(err))

                        for (let j = 0; j < book.copies.length; j++) {
                            if (book.reservation[j].userid.toString() === this._id.toString()) {
                                for (let i = 0; i < book.copies.length; i++) {
                                    if (book.copies[i].availability === 'onhold') {
                                        book.noOfBooksOnLoan = book.noOfBooksOnLoan + 1
                                        book.copies[i].availability = 'onloan'
                                        book.copies[i].borrower = {
                                            userid: this._id,
                                            borrowAt: Date(),
                                            dueDate,
                                            renews: 0
                                        }
                                        book.reservation.splice(j, 1)
                                        await book.save().catch(err => console.log(err))

                                        const newBorrow = new Borrow({
                                            userid: this._id,
                                            bookid,
                                            copyid: book.copies[i]._id,
                                            dueDate,
                                            isHighDemand: book.isHighDemand
                                        })
                                        await newBorrow.save().then(() => {
                                            return res.sendStatus(201)
                                        }).catch(err => console.log(err))
                                        break
                                    }
                                }
                                break
                            }
                            else res.json({ 'error': 'There are other users infront of the queue.' })
                        }
                    }
                    else {
                        if (book.copies.length > book.noOfBooksOnLoan)
                            for (let i = 0; i < book.copies.length; i++) {
                                if (book.copies[i].availability === 'available') {
                                    book.noOfBooksOnLoan = book.noOfBooksOnLoan + 1
                                    book.copies[i].availability = 'onloan'
                                    book.copies[i].borrower = {
                                        userid: this._id,
                                        borrowAt: Date(),
                                        dueDate,
                                        renews: 0
                                    }
                                    await book.save().catch(err => console.log(err))

                                    const newBorrow = new Borrow({
                                        userid: this._id,
                                        bookid,
                                        copyid: book.copies[i]._id,
                                        dueDate,
                                        isHighDemand: book.isHighDemand
                                    })
                                    await newBorrow.save().then(() => {
                                        return res.sendStatus(201)
                                    }).catch(err => console.log(err))
                                    break
                                }
                            }
                        else res.json({ 'error': 'No books available to loan' })
                    }
                })
        }
    }
}

const Member = User.discriminator('Member', memberSchema)

module.exports = Member