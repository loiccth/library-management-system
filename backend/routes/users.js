const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
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
const secret = process.env.JWT_SECRET

// Login for users
router.post('/login', (req, res) => {
    if (req.body.userid === "" || req.body.password === "") {
        return res.status(400).json({
            'error': 'Missing MemberID/Password.'
        })
    }

    User.findOne({ 'userid': req.body.userid }).populate('udmid')
        .then(user => {
            if (user === null) {
                return res.status(401).json({
                    'error': 'Invalid MemberID or password.'
                })
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

    else if (req.body.email === undefined) res.sendStatus(400)

    else {
        const { email } = req.body

        const udm = await UDM.findOne({ email })

        if (udm !== null) {
            const user = await User.findOne({ udmid: udm._id })

            if (user === null) {
                const password = generator.generate({ length: 10, numbers: true })
                console.log(password)

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

                Admin.findOne({ _id: req.user._id })
                    .then(admin => {
                        admin.registerMember(udm._id, userid, memberType, password, email, res)
                    })
                    .catch(err => console.log(err))
            }
            else return res.json({ 'error': 'Account already exist' })
        }
        else return res.json({ 'error': 'Email not found' })
    }
})

router.post('/register_csv', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), upload.single('csv'), (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        Admin.findOne({ _id: req.user._id })
            .then(admin => {
                admin.registerCSV(req.file.path, res)
            })
    }
})

router.post('/togglestatus', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else if (req.body.userid === undefined) return res.json({ 'error': 'Missing user id' })
    else {
        Admin.findById(req.user._id)
            .then(admin => {
                admin.toggleStatus(req.body.userid, res)
            })
    }
})

// Verify if user is already logged in on page load
router.get('/account', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user === null) return res.json({ 'success': false })

    else {
        const { _id, userid, email, phone, memberType, temporaryPassword } = req.user
        res.json({ 'success': true, _id, userid, email, phone, memberType, temporaryPassword })
    }
})

// Logout and remove cookie
router.get('/logout', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            user.logout(res)
        })
})

router.get('/', jwt({ secret, credentialsRequired: false, algorithms: ['HS256'] }), (req, res) => {
    User.find()
        .then(users => res.json({
            'success': true,
            users
        }))
        .catch(err => res.status(400).json({
            'success': false,
            'error': err.message
        }))
})

router.get('/:userid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    User.findOne({ 'userid': req.params.userid })
        .then(user => {
            if (user === null) {
                res.json({
                    'success': false,
                    'error': 'User not found'
                })
            }
            else {
                res.json({
                    'success': true,
                    user
                })
            }
        })
        .catch(err => console.log(err))
})

// Update password
router.patch('/', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (!req.body.confirmpassword || !req.body.newpassword || !req.body.oldpassword)
        return res.status(400).json({
            'error': 'Missing password param'
        })
    else if (req.body.newpassword !== req.body.confirmpassword) return res.status(400).json({ 'error': 'New password does not match with confirm password' })
    else if (req.body.newpassword === req.body.oldpassword || req.body.confirmpassword === req.body.oldpassword) return res.status(400).json({ 'error': 'New password should not match old password' })
    User.findOne({ _id: req.user._id })
        .then(user => user.changePassword(req.body.oldpassword, req.body.newpassword, res))
        .catch(err => console.log(err))
})

// Forgot my password
router.patch('/reset', (req, res) => {
    if (req.body.userid === undefined)
        return res.status(400).json({
            'error': 'Missing userid param'
        })

    axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SITEKEY}&response=${req.body.reCaptcha}`)
        .then(result => {
            if (result.data.success) {
                User.findOne({ userid: req.body.userid })
                    .then(user => {
                        if (user === null)
                            res.status(404).json({ 'error': 'MemberID not found.' })
                        else {
                            user.resetPassword(res)
                        }
                    })
                    .catch(err => console.log(err))
            }
            else {
                res.status(400).json({ 'error': 'ReCaptcha validation failed.' })
            }
        })
})

// Delete account - need admin priviledge
router.delete('/:userid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)

    Member.findOneAndDelete({ 'userid': req.params.userid })
        .then(() => res.json({
            'success': true,
            'userid': req.params.userid
        }))
        .catch(err => console.log(err))
})

router.post('/payfine/:fineid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)

    Payment.findById(req.params.findid)
        .then(payment => {
            payment.paid = true

            transaction.save().then(() => {
                res.sendStatus(200)
            })
        })
        .catch(err => console.log(err))
})

router.post('/notify', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (req.body.books === undefined) return res.status(400).json({ 'error': 'Missing list of books.' })
    else if (req.body.type === undefined) return res.status(400).json({ 'error': 'Missing notification type.' })
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.notify(req.body.books, req.body.type, res)
            })
            .catch(err => console.log(err))
    }
})

module.exports = router