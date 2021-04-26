const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const generator = require('generate-password')
const transporter = require('../../config/mail.config')
const Transaction = require('../transactions/transaction.base')
const Borrow = require('../transactions/borrow.model')
const Reserve = require('../transactions/reserve.model')
const Book = require('../book.model')
const Setting = require('../setting.model')
const UDM = require('../udm/udm.base')
const Payment = require('../payment.model')
const checkHolidays = require('../../function/checkHolidays')
const sendSMS = require('../../function/sendSMS')

const Schema = mongoose.Schema
const SALT_WORK_FACTOR = 10
const secret = process.env.JWT_SECRET

const baseOptions = {
    discriminatorKey: 'memberType',
    collection: 'members',
    timestamps: true
}

// Base attribute that other schemas inherit
const baseUserSchema = new Schema({
    udmid: { type: Schema.Types.ObjectId, ref: 'UDM', required: true, unique: true },
    userid: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    status: { type: String, required: true, enum: ['active', 'suspended'], default: 'active' },
    temporaryPassword: { type: Boolean, required: true, default: true }
}, baseOptions)

// Function called when a user is saved to the database
baseUserSchema.pre('save', function (next) {
    let user = this

    // Check if password is modified
    if (!user.isModified('password')) return next()

    // Generate a new salt and encrypt password with salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err)

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err)

            // Update password with new password hash
            user.password = hash
            next()
        })
    })
})

baseUserSchema.methods.login = async function (candidatePassword, email, phone, res) {
    // Compare password user entered with the encrypted one from database
    bcrypt.compare(candidatePassword, this.password)
        .then(async (result) => {
            // Result match
            if (result) {
                // Check if account is suspended
                if (this.status === 'suspended') {
                    return res.status(401).json({ error: 'msgLoginAccSuspended' })
                }
                // User using temporary password
                if (this.temporaryPassword) {
                    // Check if password expired
                    const userSettings = await Setting.findOne({ setting: 'USER' })
                    const temporaryTimer = userSettings.options.temp_password.value

                    const now = new Date()
                    const expireDate = new Date(new Date(this.updatedAt).getTime() + (temporaryTimer * 1000))
                    if (now > expireDate) return res.status(401).json({ error: 'msgLoginPasswordExp' })
                }
                const { _id, userid, memberType, temporaryPassword } = this
                // Sign jsonwebtoken and send it via cookie
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

                // Check if env is set to production
                if (process.env.NODE_ENV === 'production')
                    res.cookie('user', JSON.stringify({ isLoggedIn: true, _id, userid, email, phone, memberType, temporaryPassword }), {
                        expires: new Date(Date.now() + 604800000),
                        secure: false,
                        httpOnly: false,
                        sameSite: 'Lax',
                        domain: 'udmlibrary.com'
                    })
                else
                    res.cookie('user', JSON.stringify({ isLoggedIn: true, _id, userid, email, phone, memberType, temporaryPassword }), {
                        expires: new Date(Date.now() + 604800000),
                        secure: false,
                        httpOnly: false,
                        sameSite: 'Lax',
                    })

                // Send response to the user after logging in
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
            // Incorrect credentials
            else {
                res.status(401).json({
                    error: 'msgLoginInvalidCred'
                })
            }
        })
        .catch(err => console.log(err))
}

baseUserSchema.methods.logout = function (res) {
    // Remove all cookie and jsonwebtoken
    res.clearCookie('jwttoken')
    res.clearCookie('user')
    res.json({ message: 'msgLogoutSuccess' })
}

baseUserSchema.methods.changePassword = function (oldPassword, newPassword, res) {
    // Check if old password matches with the one in the database
    bcrypt.compare(oldPassword, this.password)
        .then(result => {
            // Password match
            if (result) {
                this.temporaryPassword = false
                this.password = newPassword
                this.updatedAt = Date()

                // Update password and send new jsonwebtoken and cookie
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

                        // Check if env is set to prod or dev
                        if (process.env.NODE_ENV === 'production')
                            res.cookie('user', JSON.stringify({ isLoggedIn: true, _id: this._id, userid: this.userid, email: this.email, phone: this.phone, memberType: this.memberType, temporaryPassword: false }), {
                                expires: new Date(Date.now() + 604800000),
                                secure: false,
                                httpOnly: false,
                                sameSite: 'Lax',
                                domain: 'udmlibrary.com'
                            })
                        else
                            res.cookie('user', JSON.stringify({ isLoggedIn: true, _id: this._id, userid: this.userid, email: this.email, phone: this.phone, memberType: this.memberType, temporaryPassword: false }), {
                                expires: new Date(Date.now() + 604800000),
                                secure: false,
                                httpOnly: false,
                                sameSite: 'Lax',
                            })

                        res.json({ message: 'msgPasswordChangeSuccess' })
                    })
                    .catch(err => console.log(err))
            }
            else {
                // Old password does not match
                res.status(400).json({ error: 'msgPasswordChangeNotMatch' })
            }
        })
}

baseUserSchema.methods.resetPassword = async function (res) {
    // Generate new password
    // Set user temporary password
    const pwd = generator.generate({ length: 10, numbers: true })
    this.password = pwd
    this.temporaryPassword = true
    this.updatedAt = Date()

    const email = await User.findById(this._id).populate('udmid', 'email')

    this.save()
        .then(() => {
            UDM.findById(this.udmid)
                .then(udm => {
                    // Send email notificaion with new temporary password
                    const mailForgotPassword = {
                        from: 'no-reply@udmlibrary.com',
                        to: email.udmid.email,
                        subject: 'Password Reset - UDMLibrary',
                        text: `Your new credentials for https://udmlibrary.com/ \nMemberID: ${this.userid} \nPassword: ${pwd} \nTemporary password is valid for 24 hours.`
                    }

                    sendSMS(`Your new credentials for https://udmlibrary.com/\nMemberID: ${this.userid}\nPassword: ${pwd}\nTemporary password is valid for 24 hours.`,
                        `+230${udm.phone}`)

                    // Send SMS notificaion with new temporary password
                    transporter.sendMail(mailForgotPassword, (err, info) => {
                        if (err) return res.status(500).json({ error: 'msgResetPwdUnexpectedError' })
                        else res.json({ message: 'msgResetPwdSuccess' })
                    })
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
}

baseUserSchema.methods.reserveBook = async function (bookid, res) {
    // Get number of reservations, time on hold and current amount of reservations
    const numOfReservations = await Reserve.countDocuments({ userid: this._id, status: "active" })
    const bookSettings = await Setting.findOne({ setting: 'BOOK' })
    const maxReservations = bookSettings.options.number_of_reservations.value
    const timeOnHold = bookSettings.options.time_onhold.value

    // Check if this book and user already has an active transaction
    const transaction = await Transaction.findOne({ bookid, userid: this._id, status: "active" })

    // If max reservation reached
    if (numOfReservations >= maxReservations)
        return res.status(400).json({
            error: 'msgReserveMax',
            max: maxReservations
        })
    else if (transaction !== null) {
        // User already has a copy borrowed
        if (transaction.transactionType === 'Borrow') res.status(400).json({ error: 'msgReserveDuplicate' })
        // Already reserved
        else res.status(400).json({ error: 'msgReserveAlready' })
    }
    else if (transaction === null) {
        // No transaction
        Book.findById(bookid)
            .then(async book => {
                // Book not found
                if (book === null) return res.status(404).json({ error: 'msgReserveBook404' })
                // If book available, put them on hold
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

                // Create a reservation and set expiry date if book is available
                let expireDate = new Date(new Date().getTime() + (timeOnHold * 1000))
                expireDate = await checkHolidays(expireDate)

                book.reservation.push({
                    userid: this._id,
                    reservedAt: Date(),
                    expireAt: bookAvailable ? expireDate : null
                })

                await book.save().catch(err => console.log(err))

                // Create new reservation record
                const newReservation = new Reserve({
                    userid: this._id,
                    bookid: bookid,
                    expireAt: bookAvailable ? expireDate : null
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
    // Find the reservation
    Reserve.findOne({ userid: this._id, bookid: bookid, status: 'active' })
        .then(reserve => {
            if (reserve) {
                // Mark reservation as canceled
                reserve.isCancel = true
                reserve.status = 'archive'

                reserve.save().catch(err => console.log(err))

                // Find the book
                Book.findOne({ _id: bookid })
                    .then(async book => {
                        for (let i = 0; i < book.reservation.length; i++) {
                            // Remove the canceled reservation
                            if (book.reservation[i].userid.toString() === this._id.toString()) {
                                book.reservation.splice(i, 1)
                                break
                            }
                        }

                        // If book was on hold, inform next reservation in queue if any
                        if (reserve.expireAt !== null) {
                            if (book.reservation.length - book.noOfBooksOnHold >= 0) {
                                const bookSettings = await Setting.findOne({ setting: 'BOOK' })
                                const timeOnHold = bookSettings.options.time_onhold.value

                                for (let k = 0; k < book.reservation.length; k++) {
                                    if (book.reservation[k].expireAt === null) {
                                        let expireDate = new Date(new Date().getTime() + (timeOnHold * 1000))
                                        // Check if expiry date is a public holiday or Sunday
                                        expireDate = await checkHolidays(expireDate)

                                        book.reservation[k].expireAt = expireDate
                                        Reserve.findOne({ bookid: book._id, userid: book.reservation[k].userid, status: 'active', expireAt: null })
                                            .then(reserve => {
                                                reserve.expireAt = expireDate
                                                reserve.save()
                                                    .then(() => {
                                                        // Find the user
                                                        User.findById(book.reservation[k].userid)
                                                            .populate('udmid', ['email', 'phone'])
                                                            .then(user => {
                                                                const mailNotification = {
                                                                    from: 'no-reply@udmlibrary.com',
                                                                    to: user.udmid.email,
                                                                    subject: 'Book available',
                                                                    text: `Your reservation for book titled ${book.title} is now available.`
                                                                }

                                                                // Send email notification to the next user in queue
                                                                transporter.sendMail(mailNotification, (err, info) => {
                                                                    if (err) return res.status(500).json({ error: 'msgUserRegistrationUnexpectedError' })
                                                                })

                                                                // Send SMS notification
                                                                sendSMS(`Your reservation for book titled ${book.title} is now available.`,
                                                                    `+230${user.udmid.phone}`)
                                                            })
                                                    })
                                            })
                                    }
                                }
                            }
                            // Book has no reservations
                            else {
                                book.noOfBooksOnHold--

                                // Mark copy as available
                                for (let j = 0; j < book.copies.length; j++) {
                                    if (book.copies[j].availability === 'onhold') {
                                        book.copies[j].availability = 'available'
                                        break
                                    }
                                }
                            }
                        }

                        // Save book and send response
                        book.save().then(() => res.json({ message: 'msgReserveCancelSuccess' }))
                            .catch(err => console.log(err))
                    })
            }
            else
                // Reservation not found
                res.status(404).json({ error: 'msgReserve404' })
        })
        .catch(err => console.log(err))
}

baseUserSchema.methods.renewBook = async function (borrowid, res) {
    // Find borrow transaction and get the number of renewals allowed
    const borrow = await Borrow.findById(borrowid)
    const bookSettings = await Setting.findOne({ setting: 'BOOK' })
    const renewalsAllowed = bookSettings.options.renewals_allowed.value

    if (borrow) {
        // Borrow exist
        const book = await Book.findById(borrow.bookid)

        // If there are no reservations
        if (book.reservation.length > book.noOfBooksOnHold)
            return res.status(400).json({ error: 'msgRenewReserved' })
        else {
            // Book is high demand, cannot renew
            if (borrow.isHighDemand === true) return res.status(400).json({ error: 'msgRenewHighDemand' })
            // Book reached max renewals
            else if (borrow.renews >= renewalsAllowed) return res.status(400).json({ error: 'msgRenewMax' })
            else {
                // Check if book is 2 days within due date
                // else cannot renew
                const now = new Date(new Date().toDateString())
                const borrowDate = new Date(borrow.dueDate.toDateString())
                let numOfDays = ((borrowDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
                if (numOfDays > 2) return res.status(400).json({ error: 'msgRenew2Days' })
                // Book overdue cannot renew
                else if (numOfDays < 0) return res.status(400).json({ error: 'msgRenewOverdue', days: numOfDays * -1 })
                else {
                    let newDueDate = new Date(borrow.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000)

                    // Check if new due date is a public holiday or Sunday
                    newDueDate = await checkHolidays(newDueDate)

                    // Update borrow and book details
                    borrow.renews++
                    borrow.dueDate = newDueDate
                    borrow.renewedOn.push(Date())

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

                    // Send response to the client
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
    else
        res.status(404).json({ error: 'msgBorrow404' })
}

baseUserSchema.methods.getReservedBooks = function (res) {
    // Get list of books reserved for this user and get their position in queue
    Reserve.find({ userid: this._id, status: 'active' })
        .populate('bookid', ['noOfBooksOnLoan', 'noOfBooksOnHold', 'isHighDemand', 'title', 'isbn', 'copies', 'reservation'])
        .then(booksReserved => {
            const position = []
            let temp

            // Get position in queue
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

            // Response to client
            res.json({
                booksReserved,
                position
            })
        })
}

baseUserSchema.methods.getBorrowedBooks = function (res) {
    // Get list of borrowed books
    Borrow.find({ userid: this._id, status: 'active' }).populate('bookid')
        .then(booksBorrowed => {
            return res.json(booksBorrowed)
        })
}

baseUserSchema.methods.transactionsHistory = function (res) {
    Transaction.find({ userid: this._id, status: { $ne: 'active' } })
        .populate('bookid', ['title', 'isbn'])
        .sort({ createdAt: -1 })
        .then(transactions => res.json(transactions))
        .catch(err => console.log(err))
}

baseUserSchema.methods.paymentsHistory = function (res) {
    Payment.find({ userid: this._id })
        .populate('borrowid', ['createdAt', 'returnedOn', 'dueDate'])
        .populate('bookid', ['title', 'isbn'])
        .sort({ createdAt: -1 })
        .then(payments => res.json(payments))
        .catch(err => console.log(err))
}

const User = mongoose.model('User', baseUserSchema)

module.exports = User