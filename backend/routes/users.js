const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const jwt = require('express-jwt');
const generator = require('generate-password')
const User = require('../models/users/user.base')
const Member = require('../models/users/member.model')
const Librarian = require('../models/users/librarian.model')
const Admin = require('../models/users/admin.model')
const UDM = require('../models/udm/udm.base')
const transporter = require('../config/mail.config')
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
                    'success': false,
                    'error': 'Invalid userid or password'
                })
            }
            else {
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (err) throw err

                    if (isMatch) {
                        const { _id, userid, memberType, temporaryPassword } = user
                        const { email, udmType, phone } = user.udmid
                        const token = jsonwebtoken.sign({
                            _id,
                            userid,
                            email,
                            phone,
                            memberType,
                            udmType,
                            temporaryPassword
                        }, secret, { expiresIn: '7d' })

                        res.cookie('jwttoken', token, {
                            expires: new Date(Date.now() + 604800000),
                            secure: false,
                            httpOnly: true,
                            sameSite: 'strict'
                        })

                        res.cookie('user', JSON.stringify({ isLoggedIn: true, _id, userid, email, phone, memberType, udmType, temporaryPassword }), {
                            expires: new Date(Date.now() + 604800000),
                            secure: false,
                            httpOnly: false,
                            sameSite: 'strict'
                        })

                        res.json({
                            'success': true,
                            _id,
                            userid,
                            email,
                            phone,
                            memberType,
                            udmType,
                            temporaryPassword
                        })
                    }
                    else {
                        return res.status(403).json({
                            'success': false,
                            'error': 'Invalid userid or password'
                        })
                    }
                })
            }
        })
        .catch(err => {
            return res.status(400).json({
                'success': false,
                'error': err.message
            })
        })
})

// Register a new member
router.post('/register', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)

    else if (req.body.email === undefined) res.sendStatus(400)

    else {
        const { email } = req.body
        UDM.findOne({ email })
            .then(udm => {
                if (udm === null) return res.json('not found email')
                User.findOne({ udmid: udm._id })
                    .then(user => {
                        if (user !== null) return res.json('account already exist')
                        else {
                            const password = generator.generate({ length: 10, numbers: true })
                            console.log(password)
                            let userid = null
                            if (udm.udmType === 'Student') userid = udm.studentid
                            else if (udm.udmType === 'Staff') {
                                userid = udm.firstName.slice(0, 3) + udm.lastName.slice(0, 3) + Math.random() * (100 - 10) + 10
                            }

                            const newMember = new Member({
                                udmid: udm._id,
                                userid,
                                password
                            })
                            newMember.save()
                                .then(member => {
                                    res.json({
                                        'success': true,
                                        member
                                    })

                                    // const mailRegister = {
                                    //     from: 'noreply@l0ic.com',
                                    //     to: email,
                                    //     subject: 'Register password',
                                    //     text: 'Your password is valid for 24 hours:  ' + password
                                    // }
                                    // transporter.sendMail(mailRegister, (err, info) => {
                                    //     if (err) return console.log(err.message)
                                    //     console.log(info)
                                    // })
                                })
                                .catch(err => res.status(400).json({
                                    'success': false,
                                    'error': err.message
                                }))
                        }
                    })
            })
    }
})

// Verify if user is already logged in on page load
router.get('/account', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user === null) return res.json({ 'success': false })

    else {
        const { _id, userid, email, phone, memberType, udmType, temporaryPassword } = req.user
        res.json({ 'success': true, _id, userid, email, phone, memberType, udmType, temporaryPassword })
    }
})

// Logout and remove cookie
router.get('/logout', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    res.clearCookie('jwttoken')
    res.clearCookie('user')
    res.json({ 'success': true })
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
        .catch(err => res.status(400).json({
            'success': false,
            'error': err.message
        }))
})

// Update password
router.patch('/', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.body.password === undefined || req.body.oldPassword === undefined)
        return res.status(400).json({
            'success': false,
            'error': 'Missing password param'
        })

    User.findOne({ _id: req.user._id })
        .then(user => {

            user.comparePassword(req.body.oldPassword, function (err, isMatch) {
                if (err) throw err

                if (isMatch) {
                    user.password = req.body.password
                    user.temporaryPassword = false
                    user.save()
                        .then(user => res.json({
                            'success': true,
                            user
                        }))
                        .catch(err => res.status(400).json({
                            'success': false,
                            'error': err.message
                        }))
                }
                else {
                    return res.status(403).json({
                        'success': false,
                        'error': 'Invalid password'
                    })
                }
            })
        })
        .catch(err => res.status(400).json({
            'success': false,
            'error': err.message
        }))
})

// Forgot my password
router.patch('/reset', (req, res) => {
    if (req.body.userid === undefined)
        return res.status(400).json({
            'success': false,
            'error': 'Missing userid param'
        })

    User.findOne({ userid: req.body.userid })
        .then(user => {
            const password = generator.generate({ length: 10, numbers: true })
            user.password = password
            user.temporaryPassword = true

            user.save()
                .then(user => {
                    res.json({
                        'success': true,
                        user
                    })

                    const mailForgotPassword = {
                        from: 'noreply@l0ic.com',
                        to: email,
                        subject: 'Forgot password',
                        text: 'Your new password is valid for 24 hours:  ' + password
                    }
                    transporter.sendMail(mailForgotPassword, (err, info) => {
                        if (err) return console.log(err.message)
                        console.log(info)
                    })
                })
                .catch(err => {
                    res.status(400).json({
                        'success': false,
                        'error': err.message
                    })
                })
        })
        .catch(err => {
            res.status(400).json({
                'success': false,
                'error': err.message
            })
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
        .catch(err => res.status(400).json({
            'success': false,
            'error': err.message
        }))
})

module.exports = router