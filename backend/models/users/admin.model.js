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
const borrowBook = require('../../function/borrowBook')
const sendSMS = require('../../function/sendSMS')

const Schema = mongoose.Schema

const adminSchema = new Schema()

adminSchema.methods.borrow = async function (bookid, libraryOpenTime, res) {
    const bookBorrowed = await Borrow.findOne({ bookid, userid: this._id, archive: false })

    // If already borrowed same book, return error
    if (bookBorrowed) return res.status(400).json({ error: 'msgBorrowMultiple' })
    else {
        // Get number of books borrowed this month and get book limit from settings
        const date = new Date()
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        const numOfBooksBorrowed = await Borrow.countDocuments({ userid: this._id, createdAt: { $gte: firstDay, $lte: lastDay } })
        const userSettings = await Setting.findOne({ setting: 'USER' })
        const bookLimit = userSettings.options.non_academic_borrow.value

        // Check if book limit reached return error
        if (numOfBooksBorrowed >= bookLimit) return res.status(400).json({
            error: 'msgBorrowLibrarianLimit',
            limit: bookLimit
        })
        else
            UDM.findById(this.udmid)
                .select(['email', 'phone'])
                .then(result => {
                    borrowBook(this._id, result.email, result.phone, bookid, libraryOpenTime, res)
                })
    }
}

adminSchema.methods.registerMember = function (email, res) {
    email = email.trim()

    // Check if email is in simulated UDM database
    UDM.findOne({ email })
        .then(udm => {
            if (udm) {
                User.findOne({ udmid: udm._id })
                    .then(user => {
                        // Check if account is already linked to that email address
                        if (!user) {
                            // Generate random string password
                            const password = generator.generate({ length: 10, numbers: true })

                            // Generate userid if account is a staff
                            // else use student's index number
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

                            // Create a new user and save to database
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
                                        subject: 'Account registration',
                                        text: `Account registered on https://udmlibrary.com/ \nMemberID: ${userid} \nPassword: ${password}`
                                    }

                                    // Send SMS notification with userid and temporary password
                                    sendSMS(`Account registered on https://udmlibrary.com/\nMemberID: ${userid}\nPassword: ${password}`,
                                        `+230${udm.phone}`)

                                    // Send email notification with userid and temporary password
                                    transporter.sendMail(mailRegister, (err, info) => {
                                        if (err) return res.status(500).json({ error: 'msgErrorSendingMail' })
                                        else
                                            res.status(201).json({
                                                message: 'msgUserRegistrationSuccess',
                                                member
                                            })
                                    })
                                })
                                .catch(err => console.log(err))
                        }
                        // Account already exists
                        else return res.status(400).json({ error: 'msgUserRegistrationExist' })
                    })
            }
            // Email not found in simulated udm database
            else return res.status(404).json({ error: 'msgUserRegistration404' })
        })
}

adminSchema.methods.registerCSV = function (file, res) {
    let success = []
    let fail = []
    let promises = []
    let temp = 2

    // Read csv file row by row
    fs.createReadStream(file)
        .pipe(csv())
        .on('data', (user, count = (function () {
            return temp
        })()) => {
            // Push each row in an array of promises
            promises.push(new Promise(async (resolve) => {
                let { email } = user

                // Check if email value is available in the row of the csv file
                if (email) {
                    email = email.trim()

                    const udm = await UDM.findOne({ email })
                    // Check if email is in udm's simulated database
                    if (udm) {
                        const user = await User.findOne({ udmid: udm._id })
                        // If no account is found linked with that email
                        if (!user) {
                            // Generate random password
                            const password = generator.generate({ length: 10, numbers: true })
                            let userid = null
                            // Generate random userid for staffs and use index number for students
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
                            // Create new user and save to database
                            newMember.save()
                                .then(member => {
                                    const mailRegister = {
                                        from: 'no-reply@udmlibrary.com',
                                        to: email,
                                        subject: 'Account registration',
                                        text: `Account registered on https://udmlibrary.com/ \nMemberID: ${member.userid} \nTemporary password: ${password}`
                                    }

                                    // Send SMS notification
                                    sendSMS(`Account registered on https://udmlibrary.com/\nMemberID: ${member.userid}\nTemporary password: ${password}`,
                                        `+230${udm.phone}`)

                                    // Send email notification
                                    transporter.sendMail(mailRegister, (err, info) => {
                                        if (err) return resolve(fail.push(`Row ${count}: ${email} - Error sending email`))
                                        console.log(info)
                                        // Email sent successfully
                                        resolve(success.push(`Row ${count}: ${email} registered with MemberID ${userid}`))
                                    })
                                })
                                .catch(err => console.log(err))
                        }
                        else
                            // Email already linked to an account
                            resolve(fail.push(`Row ${count}: ${email} - Account already exist`))
                    }
                    else
                        // Email not found in udm's simulated database
                        resolve(fail.push(`Row ${count}: ${email} - Email not found`))
                }
                else
                    // Email missing in csv row
                    resolve(fail.push(`Row ${count}: No email address`))
            }))
            temp++
        })
        .on('end', () => {
            // After all data is processed sort success and fail array and response to client
            Promise.all(promises)
                .then(() => {

                    success.sort()
                    fail.sort()

                    res.status(201).json({
                        success,
                        fail
                    })
                })
        })
}

adminSchema.methods.toggleStatus = function (userid, res) {
    // Find user to toggle their account's status
    User.findById(userid)
        .then(user => {
            // If user not found return error
            if (!user) res.status(404).json({ error: 'msgToggleUser404' })
            else {
                // Change their status, save to database and send response to client
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
    // Set date range to get data
    const fromDate = new Date(new Date(from).toDateString())
    const toDate = new Date(new Date(to).toDateString())
    toDate.setDate(toDate.getDate() + 1)

    // Get data within range and send response to the client
    User.find({ createdAt: { $gte: fromDate, $lt: toDate } })
        .select(['status', 'createdAt', 'userid'])
        .populate('udmid', ['firstName', 'lastName', 'email', 'phone', 'staffType', 'academic', 'faculty', 'course', 'contractEndDate', 'studentType'])
        .sort({ createdAt: 1 })
        .then(users => {
            res.json(users)
        })
        .catch(err => console.log(err))
}

const Admin = User.discriminator('Admin', adminSchema)

module.exports = Admin