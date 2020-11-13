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
        const temporaryTimer = await Setting.findOne({ setting: 'TEMPORARY_PASSWORD' })
        const now = new Date()
        const now2 = new Date().toUTCString()
        const expireDate = new Date(new Date(this.updatedOn).getTime() + (parseInt(temporaryTimer.option) * 1000))
        if (now > expireDate) return res.json({ 'error': 'Request new temporary password' })
    }

    bcrypt.compare(candidatePassword, this.password)
        .then((result) => {
            if (result) {
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
                    sameSite: 'Strict'
                })

                res.cookie('user', JSON.stringify({ isLoggedIn: true, _id, userid, email, phone, memberType, temporaryPassword }), {
                    expires: new Date(Date.now() + 604800000),
                    secure: false,
                    httpOnly: false,
                    sameSite: 'Strict'
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
            else {
                res.status(403).json({
                    'error': 'Invalid userid or password'
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

baseUserSchema.methods.resetPassword = function (res) {
    const pwd = generator.generate({ length: 10, numbers: true })
    this.password = pwd
    this.temporaryPassword = true

    console.log(pwd)

    this.save()
        .then(() => {
            res.sendStatus(200)

            // const mailForgotPassword = {
            //     from: 'noreply@l0ic.com',
            //     to: email,
            //     subject: 'Forgot password',
            //     text: 'Your new password is valid for 24 hours:  ' + pwd
            // }
            // transporter.sendMail(mailForgotPassword, (err, info) => {
            //     if (err) return console.log(err.message)
            //     console.log(info)
            // })
        })
        .catch(err => console.log(err))
}

baseUserSchema.methods.reserveBook = async function (bookid, res) {
    const numOfReservations = await Reserve.countDocuments({ userid: this._id, archive: false })

    const transaction = await Transaction.findOne({ bookid, userid: this._id, archive: false })

    if (numOfReservations > 3) return res.json({ 'error': 'Cannot reserve more than 3 books' })
    else if (transaction !== null) {
        if (transaction.transactionType === 'Borrow') res.json({ 'error': 'You already have a copy borrowed' })
        else res.json({ 'error': 'Book already reserved' })
    }
    else if (transaction === null) {
        Book.findById(bookid)
            .then(book => {
                for (let i = 0; i < book.copies.length; i++) {
                    if (book.copies[i].availability === 'available') {
                        return res.json({ 'error': 'Book is available cannot reserve' })
                    }
                }

                book.reservation.push({
                    userid: this._id,
                    reservedAt: Date()
                })

                book.save().catch(err => console.log(err))

                const newReservation = new Reserve({
                    userid: this._id,
                    bookid: bookid
                })

                newReservation.save().then(res.sendStatus(201)).catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    }
}

baseUserSchema.methods.cancelReservation = function (reservationid, res) {
    Reserve.findByIdAndUpdate(reservationid, { isCancel: true, archive: true })
        .then((reserve) => {
            Book.findOne({ _id: reserve.bookid })
                .then(book => {
                    for (let i = 0; i < book.reservation.length; i++) {
                        if (book.reservation[i].userid == this._id) {
                            book.reservation.splice(i, 1)
                            break
                        }
                    }
                    book.save().then(() => res.sendStatus(200)).catch(err => console.log(err))
                })
        })
        .catch(err => console.log(err))
}

baseUserSchema.methods.renewBook = async function (borrowid, res) {
    let borrow = await Borrow.findById(borrowid)

    const numOfReservations = await Reserve.countDocuments({ bookid: borrow.bookid, archive: false })
    const renewalsAllowed = await Setting.findOne({ setting: 'RENEWALS_ALLOWED' })

    if (numOfReservations >= parseInt(renewalsAllowed.option)) return res.json({ 'error': 'Cannot renew book because there are reservations' })
    else if (borrow.renews > 2) return res.json({ 'error': 'Reached max number of renewals' })
    else {
        const now = new Date(new Date().toDateString())
        const borrowDate = new Date(borrow.dueDate.toDateString())
        let numOfDays = ((borrowDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        if (numOfDays > 2) return res.json({ 'error': 'Can only renew within 2 days of due date' })
        else if (numOfDays < -5) return res.json({ 'error': `Cannot renew book, overdue by ${numOfDays * -1} days` })
        else {
            if (numOfDays < 0) {
                numOfDays *= -1

                const price = await Setting.findOne({ option: 'FINE_PER_DAY' })

                const newPayment = new Payment({
                    userid: this._id,
                    bookid: borrow.bookid,
                    copyid: borrow.copyid,
                    numOfDays,
                    pricePerDay: parseInt(price.option)
                })
                // TODO: send email/sms notif
                await newPayment.save().catch(err => console.log(err))
            }
            borrow.renews = borrow.renews + 1;
            borrow.dueDate = new Date(borrow.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            borrow.renewedOn = Date()

            await Book.findOne({ _id: borrow.bookid })
                .then(book => {
                    for (let i = 0; i < book.copies.length; i++) {
                        if (book.copies[i].borrower.userid.toString() === this._id.toString()) {
                            book.copies[i].borrower.renews = book.copies[i].borrower.renews + 1
                            book.copies[i].borrower.dueDate = new Date(book.copies[i].borrower.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                            break
                        }
                    }
                    book.save().catch(err => console.log(err))
                })

            await borrow.save().then(borrow => res.json(borrow)).catch(err => console.log(err))
        }
    }
}

baseUserSchema.methods.getReservedBooks = function (res) {
    Reserve.find({ userid: this._id, archive: false }).populate('bookid')
        .then(booksReserved => {
            return res.json(booksReserved)
        })
}

baseUserSchema.methods.getBorrowedBooks = function (res) {
    Borrow.find({ userid: this._id, archive: false }).populate('bookid')
        .then(booksBorrowed => {
            return res.json(booksBorrowed)
        })
}

const User = mongoose.model('User', baseUserSchema)

module.exports = User