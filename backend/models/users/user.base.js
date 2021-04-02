const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const generator = require('generate-password')
const transporter = require('../../config/mail.config')
const Transaction = require('../transactions/transaction.base')
const Borrow = require('../transactions/borrow.model')
const Reserve = require('../transactions/reserve.model')
const Book = require('../book.model')
const Payment = require('../payment.model') //TODO: Check why this is here
const Setting = require('../setting.model')
const UDM = require('../udm/udm.base')

const Schema = mongoose.Schema
const SALT_WORK_FACTOR = 10
const secret = process.env.JWT_SECRET

const baseOptions = {
    discriminatorKey: 'memberType',
    collection: 'members',
    timestamps: true
}

const baseUserSchema = new Schema({
    udmid: { type: Schema.Types.ObjectId, ref: 'UDM', required: true, unique: true },
    userid: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    status: { type: String, required: true, enum: ['active', 'suspended'], default: 'active' },
    temporaryPassword: { type: Boolean, required: true, default: true }
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
    bcrypt.compare(candidatePassword, this.password)
        .then(async (result) => {
            if (result) {
                if (this.temporaryPassword) {
                    const userSettings = await Setting.findOne({ setting: 'USER' })
                    const temporaryTimer = userSettings.options.temp_password.value

                    const now = new Date()
                    const expireDate = new Date(new Date(this.updatedAt).getTime() + (temporaryTimer * 1000))
                    if (now > expireDate) return res.status(401).json({ error: 'msgLoginPasswordExp' })
                }
                else if (this.status === 'suspended') {
                    return res.status(401).json({ error: 'msgLoginAccSuspended' })
                }
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
                    // Change when push to prod
                })

                res.json({
                    message: 'msgLoginSuccess',
                    _id,
                    userid,
                    email,
                    phone,
                    memberType,
                    temporaryPassword
                })
            }
            else {
                res.status(401).json({
                    error: 'msgLoginInvalidCred'
                })
            }
        })
        .catch(err => console.log(err))
}

baseUserSchema.methods.logout = function (res) {
    res.clearCookie('jwttoken')
    res.clearCookie('user')
    res.json({ message: 'msgLogoutSuccess' })
}

baseUserSchema.methods.changePassword = function (oldPassword, newPassword, res) {
    bcrypt.compare(oldPassword, this.password)
        .then(result => {
            if (result) {
                this.temporaryPassword = false
                this.password = newPassword
                this.updatedAt = Date()

                this.save()
                    .then(() => {
                        const token = jsonwebtoken.sign({
                            _id: this._id,
                            userid: this.userid,
                            email: this.email,
                            phone: this.phone,
                            memberType: this.memberType,
                            temporaryPassword: false
                        }, secret, { expiresIn: '7d' })

                        res.cookie('jwttoken', token, {
                            expires: new Date(Date.now() + 604800000),
                            secure: false,
                            httpOnly: true,
                            sameSite: 'Lax'
                        })

                        res.cookie('user', JSON.stringify({ isLoggedIn: true, _id: this._id, userid: this.userid, email: this.email, phone: this.phone, memberType: this.memberType, temporaryPassword: false }), {
                            expires: new Date(Date.now() + 604800000),
                            secure: false,
                            httpOnly: false,
                            sameSite: 'Lax',
                            // domain: 'udmlibrary.com'
                            // Change when push to prod
                        })

                        res.json({ message: 'msgPasswordChangeSuccess' })
                    })
                    .catch(err => console.log(err))
            }
            else {
                res.status(400).json({ error: 'msgPasswordChangeNotMatch' })
            }
        })
}

baseUserSchema.methods.resetPassword = async function (res) {
    const pwd = generator.generate({ length: 10, numbers: true })
    this.password = pwd
    this.temporaryPassword = true
    this.updatedAt = Date()

    const email = await User.findById(this._id).populate('udmid', 'email')

    this.save()
        .then(() => {
            const mailForgotPassword = {
                from: 'no-reply@udmlibrary.com',
                to: email.udmid.email,
                subject: 'Your new temporary password',
                text: 'Your new password is valid for 24 hours:  ' + pwd
            }
            transporter.sendMail(mailForgotPassword, (err, info) => {
                if (err) return res.status(500).json({ error: 'msgResetPwdUnexpectedError' })
                else res.json({ message: 'msgResetPwdSuccess' })
            })
        })
        .catch(err => console.log(err))
}

baseUserSchema.methods.reserveBook = async function (bookid, res) {
    const numOfReservations = await Reserve.countDocuments({ userid: this._id, status: "active" })
    const bookSettings = await Setting.findOne({ setting: 'BOOK' })
    const maxReservations = bookSettings.options.number_of_reservations.value
    const timeOnHold = bookSettings.options.time_onhold.value

    const transaction = await Transaction.findOne({ bookid, userid: this._id, status: "active" })

    if (numOfReservations >= maxReservations)
        return res.status(400).json({
            error: 'msgReserveMax',
            max: maxReservations
        })
    else if (transaction !== null) {
        if (transaction.transactionType === 'Borrow') res.status(400).json({ error: 'msgReserveDuplicate' })
        else res.status(400).json({ error: 'msgReserveAlready' })
    }
    else if (transaction === null) {
        Book.findById(bookid)
            .then(async book => {
                if (book === null) return res.status(404).json({ error: 'msgReserveBook404' })
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

                await book.save().catch(err => console.log(err))

                const newReservation = new Reserve({
                    userid: this._id,
                    bookid: bookid,
                    expireAt: bookAvailable ? new Date(new Date().getTime() + (timeOnHold * 1000)) : null
                })

                newReservation.save()
                    .then(reservation => {
                        res.json({
                            message: 'msgReserveSuccess',
                            reservation
                        })
                    })
                    .catch(err => console.log(err))
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
                                const bookSettings = await Setting.findOne({ setting: 'BOOK' })
                                const timeOnHold = bookSettings.options.time_onhold.value

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

                        book.save().then(() => res.json({ message: 'msgReserveCancelSuccess' }))
                            .catch(err => console.log(err))
                    })
            }
            else
                res.status(404).json({ error: 'msgReserve404' })
        })
        .catch(err => console.log(err))
}

baseUserSchema.methods.renewBook = async function (borrowid, res) {
    const borrow = await Borrow.findById(borrowid)
    const bookSettings = await Setting.findOne({ setting: 'BOOK' })
    const renewalsAllowed = bookSettings.options.renewals_allowed.value

    if (borrow) {
        const book = await Book.findById(borrow.bookid)

        if (book.reservation.length > book.noOfBooksOnHold)
            return res.status(400).json({ error: 'msgRenewReserved' })
        else {
            if (borrow.isHighDemand === true) return res.status(400).json({ error: 'msgRenewHighDemand' })
            else if (borrow.renews >= renewalsAllowed) return res.status(400).json({ error: 'msgRenewMax' })
            else {
                const now = new Date(new Date().toDateString())
                const borrowDate = new Date(borrow.dueDate.toDateString())
                let numOfDays = ((borrowDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
                if (numOfDays > 2) return res.status(400).json({ error: 'msgRenew2Days' })
                // TODO: allow renew if overdue
                else if (numOfDays < 0) return res.status(400).json({ error: 'msgRenewOverdue', days: numOfDays * -1 })
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

                    borrow.save()
                        .then(borrow => res.json({
                            message: 'msgRenewSuccess',
                            borrow
                        }))
                        .catch(err => console.log(err))
                }
            }
        }
    }
}

baseUserSchema.methods.getReservedBooks = function (res) {
    Reserve.find({ userid: this._id, status: 'active' })
        .populate('bookid', ['noOfBooksOnLoan', 'noOfBooksOnHold', 'isHighDemand', 'title', 'isbn', 'copies', 'reservation'])
        .then(booksReserved => {
            const position = []
            let temp

            for (let i = 0; i < booksReserved.length; i++) {
                temp = 0
                for (let j = 0; j < booksReserved[i].bookid.reservation.length; j++) {
                    if (String(this._id) === String(booksReserved[i].bookid.reservation[j].userid)) {
                        temp = j + 1
                        break
                    }
                }
                position.push(temp)
            }

            res.json({
                booksReserved,
                position
            })
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