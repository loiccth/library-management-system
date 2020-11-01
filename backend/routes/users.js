const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const generator = require('generate-password')
const User = require('../models/users/user.base')
const Member = require('../models/users/member.model')
const MemberA = require('../models/users/member_accademic.model')
const MemberNA = require('../models/users/member_non_accademic.model')
const Librarian = require('../models/users/librarian.model')
const Admin = require('../models/users/admin.model')
const UDM = require('../models/udm/udm.base');
const Student = require('../models/udm/student.model')
const Staff = require('../models/udm/staff.model')
const secret = process.env.JWT_SECRET;

// Login for users
router.post('/login', (req, res) => {
    if (req.body.userid === undefined || req.body.password === undefined) {
        return res.status(400).json({
            'success': false,
            'error': 'Missing userid or password'
        })
    }

    User.findOne({ 'userid': req.body.userid }).populate('udmid')
        .then(user => {
            if (user === null) {
                return res.status(403).json({
                    'error': 'Invalid userid or password'
                })
            }
            else {
                const { email, phone } = user.udmid
                user.login(req.body.password, email, phone, res)
            }
        })
        .catch(err => { throw err })
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
                    if (udm.accademic) memberType = 'MemberA'
                    else memberType = 'MemberNA'
                }

                Admin.findOne({ _id: req.user._id })
                    .then(admin => {
                        admin.registerMember(udm._id, userid, memberType, password, res)
                    })
                    .catch(err => { throw err })
            }
            else return res.json('Account already exist')
        }
        else return res.json('Email not found')
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
        .catch(err => { throw err })
})

// Update password
router.patch('/', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.body.password === undefined || req.body.oldPassword === undefined)
        return res.status(400).json({
            'error': 'Missing password param'
        })

    User.findOne({ _id: req.user._id })
        .then(user => user.changePassword(req.body.oldPassword, req.body.password, res))
        .catch(err => { throw err })
})

// Forgot my password
router.patch('/reset', (req, res) => {
    if (req.body.userid === undefined)
        return res.status(400).json({
            'error': 'Missing userid param'
        })

    User.findOne({ userid: req.body.userid })
        .then(user => {
            user.resetPassword(res)
        })
        .catch(err => { throw err })
})

// Delete account - need admin priviledge
router.delete('/:userid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)

    Member.findOneAndDelete({ 'userid': req.params.userid })
        .then(() => res.json({
            'success': true,
            'userid': req.params.userid
        }))
        .catch(err => { throw err })
})

module.exports = router