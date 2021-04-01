const mongoose = require('mongoose')
const User = require('./user.base')
const Borrow = require('../transactions/borrow.model')
const Reserve = require('../transactions/reserve.model')
const Book = require('../book.model')
const Setting = require('../setting.model')
const UDM = require('../udm/udm.base')
const Student = require('../udm/student.model')
const Staff = require('../udm/staff.model')
const csv = require('csv-parser')
const fs = require('fs')
const transporter = require('../../config/mail.config')
const generator = require('generate-password')

const Schema = mongoose.Schema

const adminSchema = new Schema()

adminSchema.methods.borrow = async function (bookid, libraryOpenTime, res) {
    const bookBorrowed = await Borrow.findOne({ bookid, userid: this._id, archive: false })

    if (bookBorrowed !== null) return res.status(400).json({ error: 'msgBorrowMultiple' })
    else {
        const date = new Date()
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        const numOfBooksBorrowed = await Borrow.countDocuments({ userid: this._id, createdAt: { $gte: firstDay, $lte: lastDay } })
        const userSettings = await Setting.findOne({ setting: 'USER' })
        const bookLimit = userSettings.options.non_academic_borrow.value

        if (numOfBooksBorrowed >= bookLimit) return res.status(400).json({
            error: 'msgBorrowLibrarianLimit',
            limit: bookLimit
        })
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

                            if (libraryOpenTime === 0) return res.status(400).json({ error: 'msgBorrowHighDemand' })
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
                                                    message: 'msgBorrowSuccess',
                                                    title: book.title,
                                                    dueDate: new Date(dueDate)
                                                })
                                            }).catch(err => console.log(err))
                                            break
                                        }
                                    }
                                    break
                                }
                                else res.status(400).json({ error: 'msgBorrowQueue' })
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
                                                message: 'msgBorrowSuccess',
                                                title: book.title,
                                                dueDate: new Date(dueDate)
                                            })
                                        }).catch(err => console.log(err))
                                        break
                                    }
                                }
                            else
                                res.status(400).json({ error: 'msgBorrowNotAvailable' })
                        }
                    })
            }
            else
                res.status(400).json({ error: 'msgBorrowMoreHighDemand' })
        }
    }
}

adminSchema.methods.registerMember = function (email, res) {
    email = email.trim()

    UDM.findOne({ email })
        .then(udm => {
            if (udm) {
                User.findOne({ udmid: udm._id })
                    .then(user => {
                        if (!user) {
                            const password = generator.generate({ length: 10, numbers: true })

                            let userid = null
                            if (udm.udmType === 'Student') {
                                userid = udm.studentid
                                memberType = 'Member'
                            }
                            else {
                                userid = udm.firstName.slice(0, 3) + udm.lastName.slice(0, 3) + Math.floor((Math.random() * 100) + 1)
                                if (udm.academic) memberType = 'MemberA'
                                else memberType = 'MemberNA'
                            }

                            const newMember = new User({
                                memberType,
                                udmid: udm._id,
                                userid,
                                password
                            })

                            newMember.save()
                                .then(member => {
                                    const mailRegister = {
                                        from: 'no-reply@udmlibrary.com',
                                        to: email,
                                        subject: 'Register password',
                                        text: `Your memberid is ${userid} and your password is valid for 24 hours:  ${password}`
                                    }
                                    transporter.sendMail(mailRegister, (err, info) => {
                                        if (err) return res.status(500).json({ error: 'msgUserRegistrationUnexpectedError' })
                                        else
                                            res.status(201).json({
                                                message: 'msgUserRegistrationSuccess',
                                                member
                                            })
                                    })
                                })
                                .catch(err => console.log(err))
                        }
                        else return res.status(400).json({ error: 'msgUserRegistrationExist' })
                    })
            }
            else return res.status(404).json({ error: 'msgUserRegistration404' })
        })
}

adminSchema.methods.registerCSV = function (file, res) {
    let success = []
    let fail = []
    let promises = []

    fs.createReadStream(file)
        .pipe(csv())
        .on('data', user => {
            promises.push(new Promise(async (resolve) => {
                let { email } = user

                email = email.trim()

                const udm = await UDM.findOne({ email })

                if (udm) {
                    const user = await User.findOne({ udmid: udm._id })

                    if (!user) {
                        const password = generator.generate({ length: 10, numbers: true })
                        let userid = null
                        if (udm.udmType === 'Student') {
                            userid = udm.studentid
                            memberType = 'Member'
                        }
                        else {
                            userid = udm.firstName.slice(0, 3) + udm.lastName.slice(0, 3) + Math.floor((Math.random() * 100) + 1)
                            if (udm.academic) memberType = 'MemberA'
                            else memberType = 'MemberNA'
                        }

                        const newMember = new User({
                            memberType,
                            udmid: udm._id,
                            userid,
                            password
                        })

                        newMember.save()
                            .then(member => {
                                const mailRegister = {
                                    from: 'no-reply@udmlibrary.com',
                                    to: email,
                                    subject: 'Register password',
                                    text: `Your memberid is ${member.userid} and your password is valid for 24 hours:  ${password}`
                                }
                                transporter.sendMail(mailRegister, (err, info) => {
                                    if (err) return resolve(fail.push(`Error sending email - ${email}`))
                                    console.log(info)
                                    resolve(success.push(`MemberID ${userid} registered with ${email}`))
                                })
                            })
                            .catch(err => console.log(err))
                    }
                    else
                        resolve(fail.push(`Account already exist - ${email}`))
                }
                else
                    resolve(fail.push(`Email not found - ${email}`))
            }))
        })
        .on('end', () => {
            Promise.all(promises)
                .then(() => {
                    res.status(201).json({
                        success,
                        fail
                    })
                })
        })
}

adminSchema.methods.toggleStatus = function (userid, res) {
    User.findById(userid)
        .then(user => {
            if (!user) res.status(404).json({ error: 'msgToggleUser404' })
            else {
                user.status = user.status === 'active' ? 'suspended' : 'active'
                user.save()
                    .then(user => res.json({
                        message: user.status === 'active' ? 'msgToggleUserSuccessActivate' : 'msgToggleUserSuccessSuspend',
                        _id: user._id,
                        status: user.status,
                        memberType: user.memberType,
                        userid: user.userid
                    }))
                    .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
}

adminSchema.methods.getMembersReport = function (from, to, res) {
    const fromDate = new Date(new Date(from).toDateString())
    const toDate = new Date(new Date(to).toDateString())
    toDate.setDate(toDate.getDate() + 1)

    User.find({ createdAt: { $gte: fromDate, $lt: toDate } })
        .select(['status', 'createdAt', 'userid'])
        .populate('udmid', ['firstName', 'lastName', 'email', 'phone', 'staffType', 'academic', 'faculty', 'contractEndDate', 'studentType'])
        .sort({ createdAt: 1 })
        .then(users => {
            res.json(users)
        })
        .catch(err => console.log(err))
}

const Admin = User.discriminator('Admin', adminSchema)

module.exports = Admin