const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const generator = require('generate-password')
const transporter = require('../../config/mail.config')
const Transaction = require('../transactions/transaction.base')
const Borrow = require('../transactions/borrow.model')
const Reserve = require('../transactions/reserve.model')
const Book = require('../book.model')
const Payment = require('../payment.model')
const Setting = require('../setting.model')
const UDM = require('../udm/udm.base')

const Schema = mongoose.Schema
const SALT_WORK_FACTOR = 10
const secret = process.env.JWT_SECRET

const baseOptions = {
    discriminatorKey: 'memberType',
    collection: 'members'
}

const baseUserSchema = new Schema({
    udmid: { type: Schema.Types.ObjectId, ref: 'UDM', required: true, unique: true },
    userid: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    status: { type: String, required: true, enum: ['active', 'suspended'], default: 'active' },
    temporaryPassword: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, default: Date() },
    updatedOn: { type: Date, default: Date() }
}, baseOptions)


baseUserSchema.pre('save', function (next) {
    let user = this

    if (!user.isModified('password')) return next()

    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err)

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err)

            user.password = hash
            next()
        })
    })
})

baseUserSchema.methods.login = async function (candidatePassword, email, phone, res) {
    if (this.temporaryPassword) {
        let temporaryTimer = await Setting.findOne({ setting: 'USER' })

        for (let i = 0; i < temporaryTimer.options.length; i++) {
            if (temporaryTimer.options[i].id === 'temp_password') {
                temporaryTimer = temporaryTimer.options[i].value
                break
            }
        }

        const now = new Date()
        const expireDate = new Date(new Date(this.updatedOn).getTime() + (temporaryTimer * 1000))
        if (now > expireDate) return res.status(401).json({ 'error': 'Temporary password expired.' })
    }

    bcrypt.compare(candidatePassword, this.password)
        .then((result) => {
            if (result) {
                if (this.status === 'suspended') {
                    res.status(401).json({ 'error': 'Account suspended.' })
                }
                else {
                    const { _id, userid, memberType, temporaryPassword } = this
                    const token = jsonwebtoken.sign({
                        _id,
                        userid,
                        email,
                        phone,
                        memberType,
                        temporaryPassword
                    }, secret, { expiresIn: '7d' })

                    res.cookie('jwttoken', token, {
                        expires: new Date(Date.now() + 604800000),
                        secure: false,
                        httpOnly: true,
                        sameSite: 'Lax'
                    })

                    res.cookie('user', JSON.stringify({ isLoggedIn: true, _id, userid, email, phone, memberType, temporaryPassword }), {
                        expires: new Date(Date.now() + 604800000),
                        secure: false,
                        httpOnly: false,
                        sameSite: 'Lax',
                        // domain: 'udmlibrary.com'
                    })

                    res.json({
                        _id,
                        userid,
                        email,
                        phone,
                        memberType,
                        temporaryPassword
                    })
                }
            }
            else {
                res.status(401).json({
                    'error': 'Invalid MemberID or Password.'
                })
            }
        })
        .catch(err => console.log(err))
}

baseUserSchema.methods.logout = function (res) {
    res.clearCookie('jwttoken')
    res.clearCookie('user')
    res.sendStatus(200)
}

baseUserSchema.methods.changePassword = function (oldPassword, newPassword, res) {
    bcrypt.compare(oldPassword, this.password)
        .then(result => {
            if (result) {
                this.temporaryPassword = false
                this.password = newPassword
                this.updatedOn = Date()

                this.save()
                    .then(() => res.sendStatus(200))
                    .catch(err => console.log(err))
            }
            else {
                res.sendStatus(403)
            }
        })
}

baseUserSchema.methods.resetPassword = async function (res) {
    const pwd = generator.generate({ length: 10, numbers: true })
    this.password = pwd
    this.temporaryPassword = true
    this.updatedOn = Date()

    console.log(pwd)

    const email = await User.findById(this._id).populate('udmid', 'email')

    this.save()
        .then(() => {
            res.sendStatus(200)

            const mailForgotPassword = {
                from: 'no-reply@udmlibrary.com',
                to: email.udmid.email,
                subject: 'Your new temporary password',
                text: 'Your new password is valid for 24 hours:  ' + pwd
            }
            transporter.sendMail(mailForgotPassword, (err, info) => {
                if (err) return console.log(err.message)
                console.log(info)
            })
        })
        .catch(err => console.log(err))
}

baseUserSchema.methods.reserveBook = async function (bookid, res) {
    const numOfReservations = await Reserve.countDocuments({ userid: this._id, status: "active" })
    let bookSettings = await Setting.findOne({ setting: 'BOOKS' })
    let maxReservations
    let timeOnHold

    for (let i = 0; i < bookSettings.options.length; i++) {
        if (bookSettings.options[i].id === 'max_number_of_reservations') {
            maxReservations = bookSettings.options[i].value
        }
        else if (bookSettings.options[i].id === 'time_onhold') {
            timeOnHold = bookSettings.options[i].value
        }
    }

    const transaction = await Transaction.findOne({ bookid, userid: this._id, status: "active" })

    if (numOfReservations >= maxReservations) return res.json({ 'error': `Cannot reserve more than ${maxReservations} books` })
    else if (transaction !== null) {
        if (transaction.transactionType === 'Borrow') res.status(400).json({ 'error': 'You already have a copy borrowed' })
        else res.status(400).json({ 'error': 'Book already reserved' })
    }
    else if (transaction === null) {
        Book.findById(bookid)
            .then(async book => {
                if (book === null) return res.status(404).json({ 'error': 'Book not found' })
                let bookAvailable = book.noOfBooksOnLoan + book.noOfBooksOnHold < book.copies.length
                if (bookAvailable) {
                    for (let i = 0; i < book.copies.length; i++) {
                        if (book.copies[i].availability === 'available') {
                            book.copies[i].availability = 'onhold'
                            book.noOfBooksOnHold++
                            break
                        }
                    }
                }

                book.reservation.push({
                    userid: this._id,
                    reservedAt: Date(),
                    expireAt: bookAvailable ? new Date(new Date().getTime() + (timeOnHold * 1000)) : null
                })

                book.save().catch(err => console.log(err))

                const newReservation = new Reserve({
                    userid: this._id,
                    bookid: bookid,
                    expireAt: bookAvailable ? new Date(new Date().getTime() + (timeOnHold * 1000)) : null
                })

                newReservation.save().then(res.sendStatus(201)).catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    }
}

baseUserSchema.methods.cancelReservation = function (bookid, res) {
    Reserve.findOne({ userid: this._id, bookid: bookid, status: 'active' })
        .then(reserve => {
            if (reserve) {
                reserve.isCancel = true
                reserve.status = 'archive'

                reserve.save().catch(err => console.log(err))

                Book.findOne({ _id: bookid })
                    .then(async book => {
                        for (let i = 0; i < book.reservation.length; i++) {
                            if (book.reservation[i].userid.toString() === this._id.toString()) {
                                book.reservation.splice(i, 1)
                                break
                            }
                        }

                        if (reserve.expireAt !== null) {
                            // TODO: if book was on hold, inform next member in queue, if any.

                            if (book.reservation.length - book.noOfBooksOnHold > 0) {
                                let bookSettings = await Setting.findOne({ setting: 'BOOKS' })
                                let timeOnHold

                                for (let i = 0; i < bookSettings.options.length; i++) {
                                    if (bookSettings.options[i].id === 'time_onhold') {
                                        timeOnHold = bookSettings.options[i].value
                                        break
                                    }
                                }
                                // TODO: need testing
                                for (let k = 0; k < book.reservation.length; k++) {
                                    if (book.reservation[k].expireAt === null) {
                                        book.reservation[k].expireAt = new Date(new Date().getTime() + (timeOnHold * 1000))
                                        Reserve.findOneAndUpdate({ bookid: book._id, userid: book.reservation[k].userid }, { expireAt: new Date(new Date().getTime() + (timeOnHold * 1000)) })
                                    }
                                }
                            }
                            else {
                                book.noOfBooksOnHold--

                                for (let j = 0; j < book.copies.length; j++) {
                                    if (book.copies[j].availability === 'onhold') {
                                        book.copies[j].availability = 'available'
                                        break
                                    }
                                }
                            }
                        }

                        book.save().then(() => res.sendStatus(200)).catch(err => console.log(err))
                    })
            }
            else
                res.sendStatus(404)
        })
        .catch(err => console.log(err))
}

baseUserSchema.methods.renewBook = async function (borrowid, res) {
    const borrow = await Borrow.findById(borrowid)
    const bookSettings = await Setting.findOne({ setting: 'BOOKS' })
    let renewalsAllowed

    for (let i = 0; i < bookSettings.options.length; i++) {
        if (bookSettings.options[i].id === 'max_number_of_renewals') {
            renewalsAllowed = bookSettings.options[i].value
            break
        }
    }

    if (borrow) {
        const book = await Book.findById(borrow.bookid)

        if (book.reservation.length > book.noOfBooksOnHold)
            return res.status(400).json({ 'error': 'Cannot renew book because there are reservations.' })
        else {
            if (borrow.isHighDemand === true) return res.status(400).json({ 'error': 'Cannot renew high demand book.' })
            else if (borrow.renews >= renewalsAllowed) return res.status(400).json({ 'error': 'Reached max number of renewals.' })
            else {
                const now = new Date(new Date().toDateString())
                const borrowDate = new Date(borrow.dueDate.toDateString())
                let numOfDays = ((borrowDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
                if (numOfDays > 2) return res.status(400).json({ 'error': 'Can only renew within 2 days of due date.' })
                else if (numOfDays < 0) return res.status(400).json({ 'error': `Book overdue by ${numOfDays * -1} day(s).` })
                else {
                    const newDueDate = new Date(borrow.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000)

                    borrow.renews++
                    borrow.dueDate = newDueDate
                    borrow.renewedOn = Date()

                    Book.findOne({ _id: borrow.bookid })
                        .then(book => {
                            for (let i = 0; i < book.copies.length; i++) {
                                if (book.copies[i].borrower.userid.toString() === this._id.toString()) {
                                    book.copies[i].borrower.renews++
                                    book.copies[i].borrower.dueDate = newDueDate
                                    break
                                }
                            }
                            book.save().catch(err => console.log(err))
                        })

                    borrow.save().then(borrow => res.json(borrow)).catch(err => console.log(err))
                }
            }
        }
    }
}

baseUserSchema.methods.getReservedBooks = function (res) {
    Reserve.find({ userid: this._id, status: 'active' }).populate('bookid')
        .then(booksReserved => {
            return res.json(booksReserved)
        })
}

baseUserSchema.methods.getBorrowedBooks = function (res) {
    Borrow.find({ userid: this._id, status: 'active' }).populate('bookid')
        .then(booksBorrowed => {
            return res.json(booksBorrowed)
        })
}

const User = mongoose.model('User', baseUserSchema)

module.exports = User