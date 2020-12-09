const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const generator = require('generate-password')
const User = require('../models/users/user.base')
const Member = require('../models/users/member.model')
const MemberA = require('../models/users/member_academic.model')
const MemberNA = require('../models/users/member_non_academic.model')
const Librarian = require('../models/users/librarian.model')
const Admin = require('../models/users/admin.model')
const UDM = require('../models/udm/udm.base')
const Student = require('../models/udm/student.model')
const Staff = require('../models/udm/staff.model')
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
                    'error': 'Invalid MemberID or Password.'
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
    if (req.body.password === undefined || req.body.oldPassword === undefined)
        return res.status(400).json({
            'error': 'Missing password param'
        })

    User.findOne({ _id: req.user._id })
        .then(user => user.changePassword(req.body.oldPassword, req.body.password, res))
        .catch(err => console.log(err))
})

// Forgot my password
router.patch('/reset', (req, res) => {
    if (req.body.userid === undefined)
        return res.status(400).json({
            'error': 'Missing userid param'
        })

    User.findOne({ userid: req.body.userid })
        .then(user => {
            if (user === null)
                res.status(404).json({ 'error': 'MemberID not found.' })
            else {
                user.resetPassword(res)
            }
        })
        .catch(err => console.log(err))
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

router.post('/notifyoverdue', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    if (req.body.overdueBooks === undefined) return res.json({ 'error': 'Missing list of overdue books' })
    else {
        Librarian.findById(req.user._id)
            .then(librarian => {
                librarian.notifyOverdue(req.body.overdueBooks, res)
            })
            .catch(err => console.log(err))
    }
})

module.exports = router