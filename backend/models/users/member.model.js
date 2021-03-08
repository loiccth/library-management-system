const mongoose = require('mongoose')
const User = require('./user.base')
const Borrow = require('../transactions/borrow.model')
const Reserve = require('../transactions/reserve.model')
const Book = require('../book.model')
const Setting = require('../setting.model')

const Schema = mongoose.Schema

const memberSchema = new Schema()

memberSchema.methods.borrow = async function (bookid, libraryOpenTime, res) {
    const bookBorrowed = await Borrow.findOne({ bookid, userid: this._id, status: 'active' })
    if (bookBorrowed !== null) return res.json({ 'message': 'Cannot borrow multiple copies of the same book.' })
    else {
        const numOfBooksBorrowed = await Borrow.countDocuments({ userid: this._id, status: 'active' })
        const userSettings = await Setting.findOne({ setting: 'USER' })
        const bookLimit = userSettings.options.student_borrow.value

        if (numOfBooksBorrowed >= bookLimit) return res.json({ 'message': `Cannot borrow more than ${bookLimit} books at the same time.` })
        else {

            const numOfHighDemandBooksBorrowed = await Borrow.countDocuments({ userid: this._id, status: 'active', isHighDemand: true })

            if (numOfHighDemandBooksBorrowed <= 0) {
                const now = new Date()
                const bookReserved = await Reserve.findOne({ bookid, userid: this._id, status: 'active', expireAt: { $gte: now } })

                Book.findById(bookid)
                    .then(async book => {
                        let dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        if (book.isHighDemand === true) {
                            const tomorrow = new Date()
                            tomorrow.setDate(tomorrow.getDate() + 2)
                            tomorrow.setHours(0, 0, 0, 0)

                            if (libraryOpenTime === 0) return res.json({ 'message': 'Cannot issue high demand book, library is closed tomorrow.' })
                            else dueDate = tomorrow.setSeconds(libraryOpenTime + 1800)
                        }

                        if (bookReserved !== null) {
                            bookReserved.status = 'archive'
                            bookReserved.save().catch(err => console.log(err))

                            for (let j = 0; j < book.reservation.length; j++) {
                                if (book.reservation[j].userid.toString() === this._id.toString()) {
                                    for (let i = 0; i < book.copies.length; i++) {
                                        if (book.copies[i].availability === 'onhold') {
                                            book.noOfBooksOnLoan++
                                            book.noOfBooksOnHold++
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
                                                return res.status(201).json({
                                                    title: book.title,
                                                    dueDate: new Date(dueDate)
                                                })
                                            }).catch(err => console.log(err))
                                            break
                                        }
                                    }
                                    break
                                }
                                else res.json({ 'message': 'There are other users infront of the queue.' })
                            }
                        }
                        else {
                            if (book.copies.length > book.noOfBooksOnLoan + book.noOfBooksOnHold)
                                for (let i = 0; i < book.copies.length; i++) {
                                    if (book.copies[i].availability === 'available') {
                                        book.noOfBooksOnLoan++
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
                                            return res.status(201).json({
                                                title: book.title,
                                                dueDate: new Date(dueDate)
                                            })
                                        }).catch(err => console.log(err))
                                        break
                                    }
                                }
                            else
                                res.json({ 'message': 'No books available to loan.' })
                        }
                    })
            }
            else
                res.json({ 'message': 'Cannot borrow more than one high demand book.' })
        }
    }
}

const Member = User.discriminator('Member', memberSchema)

module.exports = Member