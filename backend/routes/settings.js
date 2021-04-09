const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const Librarian = require('../models/users/librarian.model')
const Setting = require('../models/setting.model')
const secret = process.env.JWT_SECRET

// Get locations for pamplemousses and rosehill campus
router.get('/locations', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else {
        const pamLocation = await Setting.findOne({ 'setting': 'PAM_LOCATIONS' }).select('options')
        const rhillLocation = await Setting.findOne({ 'setting': 'RHILL_LOCATIONS' }).select('options')

        // Send locations to the client
        res.json({
            pam: pamLocation,
            rhill: rhillLocation
        })
    }
})

// Add a new location
router.post('/add_locations', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    // Check user access
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    // Check if user supplied campus and location name
    else if (!req.body.campus || !req.body.location) return res.sendStatus(400)
    else {
        // Adding to pam campus
        if (req.body.campus === 'pam') {
            Setting.findOne({ 'setting': 'PAM_LOCATIONS' })
                .then(setting => {
                    // Check if location already added
                    if (!setting.options.includes(req.body.location)) {
                        // Add location and sort by ascending
                        setting.options.push(req.body.location)
                        setting.options.sort()

                        // Save to database and send response
                        setting.markModified('options')
                        setting.save()
                            .then((newSettings) => {
                                res.json({
                                    message: 'msgLocationSettingsAdd',
                                    campus: 'pam',
                                    location: newSettings.options
                                })
                            })
                    }
                    else
                        // Location duplicate
                        res.status(400).json({
                            error: 'msgLocationSettingsDuplicate'
                        })
                })
        }
        // Add location to rhill
        else if (req.body.campus === 'rhill') {
            Setting.findOne({ 'setting': 'RHILL_LOCATIONS' })
                .then(setting => {
                    // Check for duplication
                    if (!setting.options.includes(req.body.location)) {
                        // Add and sort
                        setting.options.push(req.body.location)
                        setting.options.sort()

                        setting.markModified('options')
                        setting.save()
                            .then((newSettings) => {
                                // Save and send response
                                res.json({
                                    message: 'msgLocationSettingsAdd',
                                    campus: 'rhill',
                                    location: newSettings.options
                                })
                            })
                    }
                    else
                        // Location duplicate
                        res.status(400).json({
                            error: 'msgLocationSettingsDuplicate'
                        })
                })
        }
    }
})

// Remove location from database
router.post('/remove_locations', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (!req.body.campus || !req.body.location) return res.sendStatus(400)
    else {
        if (req.body.campus === 'pam') {
            Setting.findOne({ 'setting': 'PAM_LOCATIONS' })
                .then(setting => {
                    if (setting.options.includes(req.body.location)) {
                        // Remove location from database and sort
                        setting.options.splice(setting.options.indexOf(req.body.location), 1)
                        setting.options.sort()

                        setting.markModified('options')
                        setting.save()
                            .then((newSettings) => {
                                res.json({
                                    message: 'msgLocationSettingsRemove',
                                    campus: 'pam',
                                    location: newSettings.options
                                })
                            })
                    }
                    else
                        // Location not found
                        res.status(404).json({
                            error: 'msgLocationSettings404'
                        })
                })
        }
        else if (req.body.campus === 'rhill') {
            Setting.findOne({ 'setting': 'RHILL_LOCATIONS' })
                .then(setting => {
                    // Check if location is in database, remove and sort
                    if (setting.options.includes(req.body.location)) {
                        setting.options.splice(setting.options.indexOf(req.body.location), 1)
                        setting.options.sort()

                        setting.markModified('options')
                        setting.save()
                            .then((newSettings) => {
                                res.json({
                                    message: 'msgLocationSettingsRemove',
                                    campus: 'rhill',
                                    location: newSettings.options
                                })
                            })
                    }
                    else
                        res.status(404).json({
                            error: 'msgLocationSettings404'
                        })
                })
        }
    }
})

// Get list of categories
router.get('/categories', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    const categories = await Setting.findOne({ 'setting': 'CATEGORIES' }).select('options')

    res.json(categories.options)
})

// Add new category
router.post('/add_categories', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (!req.body.category) return res.sendStatus(400)
    else {
        Setting.findOne({ 'setting': 'CATEGORIES' })
            .then(setting => {
                if (!setting.options.includes(req.body.category)) {
                    setting.options.push(req.body.category)
                    setting.options.sort()

                    setting.markModified('options')
                    setting.save()
                        .then((newSettings) => {
                            res.json({
                                message: 'msgCategorySettingsAdd',
                                categories: newSettings.options
                            })
                        })
                }
                else
                    res.status(400).json({
                        error: 'msgCategorySettingsDuplicate'
                    })
            })
    }
})

// Remove a category from database
router.post('/remove_categories', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian') return res.sendStatus(403)
    else if (!req.body.category) return res.sendStatus(400)
    else {
        Setting.findOne({ 'setting': 'CATEGORIES' })
            .then(setting => {
                if (setting.options.includes(req.body.category)) {
                    setting.options.splice(setting.options.indexOf(req.body.category), 1)
                    setting.options.sort()

                    setting.markModified('options')
                    setting.save()
                        .then((newSettings) => {
                            res.json({
                                message: 'msgCategorySettingsRemove',
                                categories: newSettings.options
                            })
                        })
                }
                else
                    res.status(404).json({
                        error: 'msgCategorySettings404'
                    })
            })
    }
})

// Get opening and closing hours
router.get('/hours', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    const openingHours = await Setting.findOne({ 'setting': 'OPENING_HOURS' }).select('options')
    const closingHours = await Setting.findOne({ 'setting': 'CLOSING_HOURS' }).select('options')

    const baseTime = new Date()
    baseTime.setHours(0, 0, 0, 0)

    // Calculate hours
    for (let i = 0; i < openingHours.options.length; i++) {
        openingHours.options[i].time = new Date(baseTime.getTime() + (openingHours.options[i].time * 1000))
        closingHours.options[i].time = new Date(baseTime.getTime() + (closingHours.options[i].time * 1000))
    }

    // Send response
    res.json({
        opening: openingHours,
        closing: closingHours
    })

})

// Update opening and closing hours
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
            res.json({ message: 'msgHoursSettingsUpdated' })
        else
            res.status(400).json({ error: 'msgHoursSettingsNotUpdated' })
    }
})

// Get book settings
router.get('/books', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
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

// Update book settings
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
        res.json({ message: 'msgBookSettingsUpdated' })
    }
})

// Get user settings
router.get('/users', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
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

// Update user settings
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
        res.json({ message: 'msgUserSettingsUpdated' })
    }
})

// Get information about the library system for the information page
router.get('/info', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    const openingHours = await Setting.findOne({ 'setting': 'OPENING_HOURS' }).select('options')
    const closingHours = await Setting.findOne({ 'setting': 'CLOSING_HOURS' }).select('options')
    const bookSettings = await Setting.findOne({ 'setting': 'BOOK' }).select('options')
    bookSettings.options.time_onhold.value /= (60 * 60)
    const userSettings = await Setting.findOne({ 'setting': 'USER' }).select('options')
    userSettings.options.temp_password.value /= (60 * 60)

    const hours = []

    const baseTime = new Date()
    baseTime.setHours(0, 0, 0, 0)

    for (let i = 0; i < openingHours.options.length; i++) {
        hours.push({
            day: openingHours.options[i].day,
            open: new Date(baseTime.getTime() + (openingHours.options[i].time * 1000)),
            close: new Date(baseTime.getTime() + (closingHours.options[i].time * 1000))
        })
    }

    res.json({
        hours,
        book: bookSettings.options,
        user: userSettings.options
    })
})

module.exports = router