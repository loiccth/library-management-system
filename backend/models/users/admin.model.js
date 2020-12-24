const mongoose = require('mongoose')
const User = require('./user.base')
const Borrow = require('../transactions/borrow.model')
const Reserve = require('../transactions/reserve.model')
const Book = require('../book.model')
const Setting = require('../setting.model')
const transporter = require('../../config/mail.config')

const Schema = mongoose.Schema

const adminSchema = new Schema()

adminSchema.methods.borrow = async function (bookid, libraryOpenTime, res) {
    const bookBorrowed = await Borrow.findOne({ bookid, userid: this._id, archive: false })

    if (bookBorrowed !== null) return res.json({ 'message': 'Cannot borrow multiple copies of the same book.' })
    else {
        const date = new Date()
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        const numOfBooksBorrowed = await Borrow.countDocuments({ userid: this._id, createdAt: { $gte: firstDay, $lte: lastDay } })
        let bookLimit = await Setting.findOne({ setting: 'USER' })

        for (let i = 0; i < bookLimit.options.length; i++) {
            if (bookLimit.options[i].id === 'non_academic_borrow_count') {
                bookLimit = bookLimit.options[i].value
                break
            }
        }

        if (numOfBooksBorrowed >= bookLimit) return res.json({ 'message': `Cannot borrow more than ${bookLimit} books in a month.` })
        else {

            const numOfHighDemandBooksBorrowed = await Borrow.countDocuments({ userid: this._id, status: 'active', isHighDemand: true })

            if (numOfHighDemandBooksBorrowed <= 0) {
                const now = new Date()
                const bookReserved = await Reserve.findOne({ bookid, userid: this._id, archive: false, expireAt: { $gte: now } })

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

adminSchema.methods.registerMember = function (udmid, userid, memberType, password, email, res) {
    const newMember = new User({
        memberType,
        udmid,
        userid,
        password
    })

    newMember.save()
        .then(member => {
            res.json({
                member
            })

            const mailRegister = {
                from: 'no-reply@udmlibrary.com',
                to: email,
                subject: 'Register password',
                text: `Your memberid is ${userid} and your password is valid for 24 hours:  ${password}`
            }
            transporter.sendMail(mailRegister, (err, info) => {
                if (err) return console.log(err.message)
                console.log(info)
            })
        })
        .catch(err => console.log(err))
}

adminSchema.methods.toggleStatus = function (userid, res) {
    User.findById(userid)
        .then(user => {
            if (user === null) res.json({ 'error': 'User not found' })
            else {
                user.status = !user.status
                user.save()
                    .then(() => res.sendStatus(200))
                    .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
}

const Admin = User.discriminator('Admin', adminSchema)

module.exports = Admin