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

    Setting.findOne({ 'setting': 'OPENING_HOURS' })
        .then(hours => {
            for (let i = 0; i < opening.length; i++) {
                let seconds = 0
                let temp = new Date(opening[i].time)
                seconds += temp.getHours() * 3600
                seconds += temp.getMinutes() * 60
                hours.options[i].time = seconds
            }
            hours.markModified('options')
            hours.save()
        })
    Setting.findOne({ 'setting': 'CLOSING_HOURS' })
        .then(hours => {
            for (let i = 0; i < closing.length; i++) {
                let seconds = 0
                let temp = new Date(closing[i].time)
                seconds += temp.getHours() * 3600
                seconds += temp.getMinutes() * 60
                hours.options[i].time = seconds
            }
            hours.markModified('options')
            hours.save()
        })
    res.json({ 'message': 'Opening and closing hours updated.' })
})

module.exports = router