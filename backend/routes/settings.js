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

module.exports = router