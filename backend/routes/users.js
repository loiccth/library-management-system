const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const mongoose = require('mongoose')
const axios = require('axios')
const generator = require('generate-password')
const multer = require('multer')
const upload = multer({ dest: 'uploads/users/' })
const User = require('../models/users/user.base')
const Member = require('../models/users/member.model')
const MemberA = require('../models/users/member_academic.model')
const MemberNA = require('../models/users/member_non_academic.model')
const Librarian = require('../models/users/librarian.model')
const Admin = require('../models/users/admin.model')
const UDM = require('../models/udm/udm.base')
const Student = require('../models/udm/student.model')
const Staff = require('../models/udm/staff.model')
const Payment = require('../models/payment.model')
const escapeRegExp = require('../function/escapeRegExp')
const secret = process.env.JWT_SECRET

// Login for users
router.post('/login', (req, res) => {
    if (!req.body.userid || !req.body.password) {
        return res.status(400).json({ error: 'msgLoginMissingParams' })
    }

    User.findOne({ 'userid': req.body.userid }).populate('udmid')
        .then(user => {
            if (!user) {
                // User not found
                return res.status(401).json({ error: 'msgLoginInvalidCred' })
            }
            else {
                const { email, phone } = user.udmid
                user.login(req.body.password, email, phone, res)
            }
        })
        .catch(err => console.log(err))
})

// Register a new member
router.post('/register', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else if (!req.body.email) return res.sendStatus(400)
    else {
        Admin.findById(req.user._id)
            .then(admin => {
                admin.registerMember(req.body.email, res)
            })
            .catch(err => console.log(err))
    }
})

// Register members by csv file
router.post('/register_csv', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), upload.single('csv'), (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        Admin.findById(req.user._id)
            .then(admin => {
                admin.registerCSV(req.file.path, res)
            })
    }
})

// Suspend/unsuspend user account
router.post('/togglestatus', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else if (!req.body.userid) return res.status(400).json({ error: 'msgMissingParams' })
    else if (!mongoose.Types.ObjectId.isValid(req.body.userid)) return res.status(404).json({ error: 'msgToggleUser404' })
    else {
        Admin.findById(req.user._id)
            .then(admin => {
                admin.toggleStatus(req.body.userid, res)
            })
    }
})

// Verify if user is already logged in on page load
router.get('/account', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (!req.user) {
        res.clearCookie('jwttoken')
        res.clearCookie('user')
        res.sendStatus(200)
    }
    else {
        const { _id, userid, email, phone, memberType, temporaryPassword } = req.user
        res.json({ _id, userid, email, phone, memberType, temporaryPassword })
    }
})

// Logout and remove cookie
router.get('/logout', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user._id)
        User.findById(req.user._id)
            .then(user => {
                if (user)
                    user.logout(res)
                else
                    res.sendStatus(404)
            })
    else {
        res.clearCookie('jwttoken')
        res.clearCookie('user')
        res.json({ message: 'msgLogoutSuccess' })
    }
})

// Update password
router.patch('/', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (!req.body.confirmpassword || !req.body.newpassword || !req.body.oldpassword) return res.status(400).json({ error: 'msgMissingParams' })
    else if (req.body.newpassword !== req.body.confirmpassword) return res.status(400).json({ error: 'msgPasswordChangeNewPassNotMatch' })
    else if (req.body.newpassword === req.body.oldpassword || req.body.confirmpassword === req.body.oldpassword) return res.status(400).json({ error: 'msgPasswordChangeOldNew' })
    User.findById(req.user._id)
        .then(user => user.changePassword(req.body.oldpassword, req.body.newpassword, res))
        .catch(err => console.log(err))
})

// Forgot my password
router.patch('/reset', (req, res) => {
    if (!req.body.userid) return res.status(400).json({ error: 'msgMissingParams' })
    // Validate recapcha challenge
    axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SITEKEY}&response=${req.body.reCaptcha}`)
        .then(result => {
            if (result.data.success) {
                User.findOne({ userid: req.body.userid })
                    .then(user => {
                        if (user === null)
                            res.status(404).json({ error: 'msgResetPwdUser404' })
                        else {
                            user.resetPassword(res)
                        }
                    })
                    .catch(err => console.log(err))
            }
            else {
                // Validation failed
                res.status(400).json({ error: 'msgResetPwdReCaptchaFail' })
            }
        })
})

// Delete account - need admin priviledge
router.delete('/:userid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    Member.findOneAndDelete({ userid: req.params.userid })
        .then(() => res.json({ userid: req.params.userid }))
        .catch(err => console.log(err))
})

// User paid fine
router.post('/payfine/:fineid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)

    Payment.findById(req.params.fineid)
        .then(payment => {
            if (payment) {
                // Check if fine already paid
                if (!payment.paid) {
                    payment.paid = true

                    payment.save().then(() => {
                        res.json({ message: 'msgPaymentSuccess', payment })
                    })
                }
                else
                    // Already paid
                    res.status(400).json({ error: 'msgPaymentAlreadyPaid' })
            }
            else
                // Fine record not found
                res.status(404).json({ error: 'msgPayment404' })
        })
        .catch(err => console.log(err))
})

// Send notification to users with due/overdue books
router.post('/notify', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (!req.body.books || !req.body.type) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.notify(req.body.books, req.body.type, res)
            })
            .catch(err => console.log(err))
    }
})

// Search users
router.post('/search', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else if (!req.body.userid) return res.json({ error: 'msgUserSearchEmpty' })
    else {
        // Create regex to fuzzy search users
        const regex = new RegExp(escapeRegExp(req.body.userid), 'gi')
        User.find({ userid: regex }).select(['_id', 'userid', 'status'])
            .then(users => {
                if (users.length > 0)
                    res.json(users)
                else res.status(404).json({ error: 'msgUserSearch404' })
            })
    }
})

// Get list of fines
router.get('/fine', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        Payment.find({ paid: false })
            .populate('borrowid')
            .populate('userid', ['userid'])
            .populate('bookid', ['title', 'isbn'])
            .sort({ createdAt: 1 })
            .then(payments => {
                res.json(payments)
            })
            .catch(err => console.log(err))
    }
})

// Generate members report
router.post('/membersreport', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else if (!req.body.from || !req.body.to) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        Admin.findById(req.user._id)
            .then(admin => {
                admin.getMembersReport(req.body.from, req.body.to, res)
            })
            .catch(err => console.log(err))
    }
})

module.exports = router