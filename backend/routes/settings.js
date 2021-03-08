const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const Librarian = require('../models/users/librarian.model')
const Setting = require('../models/setting.model')
const secret = process.env.JWT_SECRET

router.get('/locations', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    const pamLocation = await Setting.findOne({ 'setting': 'PAM_LOCATIONS' }).select('options')
    const rhillLocation = await Setting.findOne({ 'setting': 'RHILL_LOCATIONS' }).select('options')

    res.json({
        pam: pamLocation,
        rhill: rhillLocation
    })
})

router.get('/hours', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    const openingHours = await Setting.findOne({ 'setting': 'OPENING_HOURS' }).select('options')
    const closingHours = await Setting.findOne({ 'setting': 'CLOSING_HOURS' }).select('options')

    const baseTime = new Date()
    baseTime.setHours(0, 0, 0, 0)

    for (let i = 0; i < openingHours.options.length; i++) {
        openingHours.options[i].time = new Date(baseTime.getTime() + (openingHours.options[i].time * 1000))
        closingHours.options[i].time = new Date(baseTime.getTime() + (closingHours.options[i].time * 1000))
    }

    res.json({
        opening: openingHours,
        closing: closingHours
    })

})

router.put('/hours', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    const { opening, closing } = req.body

    let updated = false

    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        await Setting.findOne({ 'setting': 'OPENING_HOURS' })
            .then(hours => {
                for (let i = 0; i < opening.length; i++) {
                    let seconds = 0
                    let temp = new Date(opening[i].time)
                    seconds += temp.getHours() * 3600
                    seconds += temp.getMinutes() * 60
                    if (hours.options[i].time !== seconds) {
                        updated = true
                        hours.options[i].time = seconds
                    }
                }
                hours.markModified('options')
                hours.save()
            })
        await Setting.findOne({ 'setting': 'CLOSING_HOURS' })
            .then(hours => {
                for (let i = 0; i < closing.length; i++) {
                    let seconds = 0
                    let temp = new Date(closing[i].time)
                    seconds += temp.getHours() * 3600
                    seconds += temp.getMinutes() * 60
                    if (hours.options[i].time !== seconds) {
                        updated = true
                        hours.options[i].time = seconds
                    }
                }
                hours.markModified('options')
                hours.save()
            })
        if (updated)
            res.json({ 'message': 'Opening and closing hours updated.' })
        else
            res.status(400).json({ 'error': 'Opening/closing hours did not change.' })
    }
})

router.get('/books_test', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    const bookSettings = await Setting.findOne({ 'setting': 'BOOK' }).select('options')
    bookSettings.options.time_onhold.value /= 60

    const temp = []

    for (let i in bookSettings.options) {
        temp.push({
            name: bookSettings.options[i].name,
            value: bookSettings.options[i].value,
            id: i
        })
    }

    res.json(temp)
})

router.put('/books', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    const { bookSettings } = req.body

    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        Setting.findOne({ 'setting': 'BOOK' })
            .then(settings => {
                for (let i = 0; i < bookSettings.length; i++) {
                    if (bookSettings[i].name === 'Time onhold')
                        settings.options.time_onhold.value = bookSettings[i].value * 60
                    else {
                        let temp = bookSettings[i].name
                        temp = temp.split(' ').join('_')
                        temp = temp.toLowerCase()

                        settings.options[temp].value = bookSettings[i].value
                    }
                }
                settings.markModified('options')
                settings.save()
            })
        res.json({ 'message': 'Book settings updated.' })
    }
})

router.get('/users_test', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    const userSettings = await Setting.findOne({ 'setting': 'USER' }).select('options')
    userSettings.options.temp_password.value /= 60

    const temp = []

    for (let i in userSettings.options) {
        temp.push({
            name: userSettings.options[i].name,
            value: userSettings.options[i].value,
            id: i
        })
    }

    res.json(temp)
})

router.put('/users', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    const { userSettings } = req.body

    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        Setting.findOne({ 'setting': 'USER' })
            .then(settings => {
                for (let i = 0; i < userSettings.length; i++) {
                    if (userSettings[i].name === 'Temporary password')
                        settings.options.temp_password.value = userSettings[i].value * 60
                    else {
                        let temp = userSettings[i].name
                        temp = temp.split(' ').join('_')
                        temp = temp.replace('-', '_')
                        temp = temp.toLowerCase()

                        settings.options[temp].value = userSettings[i].value
                    }
                }
                settings.markModified('options')
                settings.save()
            })
        res.json({ 'message': 'User settings updated.' })
    }
})

module.exports = router