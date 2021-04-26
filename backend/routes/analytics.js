const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const Analytics = require('../models/analytics.model')
const User = require('../models/users/user.base')
const axios = require('axios')
const secret = process.env.JWT_SECRET
const mongoose = require('mongoose')
const escapeRegExp = require('../function/escapeRegExp')

// Records every page visit and action that a client does
router.post('/', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    const { sessionid, device, userAgent, event } = req.body
    if (!sessionid || !device || !userAgent || !event) return res.status(400).json({ error: 'msgMissingParams' })

    else {
        let ip

        // Get the client's ip address if the env is set to prod
        if (process.env.NODE_ENV === 'production') {
            ip = req.headers['x-forwarded-for']
            ip = ip.split(', ')
            ip = ip[0]
        }
        // Set random ip address if dev/staging env
        else
            ip = '175.45.176.0'

        // Remove ipv6
        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7)
        }

        // Add record to database
        Analytics.find({ sessionid: sessionid })
            .then(async session => {
                // Check if session already exist, else create new session
                sessionDate = session.length > 0 ? session[0].sessionDate : new Date()

                // Get ip geolocation details
                if (session.length === 0 || event.info === 'login success' || (session.length > 0 && req.user && String(session[0].userid) !== req.user._id)) {
                    const geolocationDetails = await axios.post(`http://api.ipstack.com/${ip}?access_key=${process.env.IPSTACK_API}`)

                    const { continent_code, continent_name, country_code, country_name, region_code, region_name, city } = geolocationDetails.data

                    // Create new analytic record
                    const newAnalytics = new Analytics({
                        sessionid,
                        sessionDate,
                        userid: req.user ? req.user._id : null,
                        ip,
                        geolocation: {
                            continentCode: continent_code,
                            continentName: continent_name,
                            countryCode: country_code,
                            countryName: country_name,
                            regionCode: region_code,
                            regionName: region_name,
                            city
                        },
                        device,
                        userAgent,
                        event
                    })
                    newAnalytics.save().then(() => res.sendStatus(200))
                }
                // If session already exist, no need to get ip geolocation
                else {
                    const newAnalytics = new Analytics({
                        sessionid,
                        sessionDate,
                        userid: req.user ? req.user._id : null,
                        ip,
                        device,
                        userAgent,
                        event
                    })

                    // Save to database
                    newAnalytics.save().then(() => res.sendStatus(200))
                }
            })
    }
})

// Get the list of total users, guests and logged in users in the past 7 days
router.get('/sessions', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setHours(0, 0, 0, 0)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

        // Get the number of total users within the date range and group by the createdAt date
        const total = await Analytics.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: sevenDaysAgo,
                        $lte: new Date()
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%m/%d/%Y', date: { $add: ['$createdAt', 14400000] } } },
                    count: { $addToSet: "$sessionid" }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])

        // Get the number of users within the date range and group by the createdAt date
        const users = await Analytics.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: sevenDaysAgo,
                        $lte: new Date()
                    },
                    userid: {
                        $ne: null
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%m/%d/%Y', date: { $add: ['$createdAt', 14400000] } } },
                    count: { $addToSet: "$sessionid" }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])

        // Get the number of guests within the date range and group by the createdAt date
        const guests = await Analytics.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: sevenDaysAgo,
                        $lte: new Date()
                    },
                    userid: {
                        $eq: null
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%m/%d/%Y', date: { $add: ['$createdAt', 14400000] } } },
                    count: { $addToSet: "$sessionid" }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])


        // Format the data so that the frontend can display it appropriately
        const labels = []
        const totalData = [0, 0, 0, 0, 0, 0, 0]
        const usersData = [0, 0, 0, 0, 0, 0, 0]
        const guestsData = [0, 0, 0, 0, 0, 0, 0]

        for (let i = 0; i < 7; i++) {
            if (i !== 0)
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() + 1)

            for (let j = 0; j < total.length; j++) {
                if (new Date(total[j]._id) - sevenDaysAgo === 0) {
                    totalData[i] = total[j].count.length
                    break
                }
            }

            for (let k = 0; k < users.length; k++) {
                if (new Date(users[k]._id) - sevenDaysAgo === 0) {
                    usersData[i] = users[k].count.length
                    break
                }
            }

            for (let l = 0; l < guests.length; l++) {
                if (new Date(guests[l]._id) - sevenDaysAgo === 0) {
                    guestsData[i] = guests[l].count.length
                    break
                }
            }
            labels.push(sevenDaysAgo.toLocaleDateString('en-GB'))
        }

        // Send response to the client
        res.json({
            labels,
            totalData,
            usersData,
            guestsData
        })
    }
})

// Get the list of devices used in the past 7 days
router.get('/devices', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        // Set date range
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setHours(0, 0, 0, 0)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

        // Get list of users who entered the website
        // and group by their device type
        // and count the number of occurance
        Analytics.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: sevenDaysAgo,
                        $lte: new Date()
                    }
                }
            },
            {
                $group: {
                    _id: '$device',
                    count: { $addToSet: "$sessionid" }
                }
            },
        ])
            .then(result => {
                // Format the data for the frontend to display it
                let labels = ['Desktop', 'Tablet', 'Mobile']
                let data = [0, 0, 0]

                for (let i = 0; i < result.length; i++) {
                    if (result[i]._id === 'browser')
                        data[0] = result[i].count.length
                    else if (result[i]._id === 'tablet')
                        data[1] = result[i].count.length
                    else if (result[i]._id === 'mobile')
                        data[2] = result[i].count.length

                }

                // Send response to the client
                res.json({
                    labels,
                    data
                })
            })
    }
})

// Get website statistics for administrators
// It will get number of users logged in, guests, failed login attemps and password resets
// for the past 24 hours
router.get('/stats', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        // Set date range
        const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000))

        // Get failed login count and password reset count
        const regexLogin = new RegExp(escapeRegExp('login attempt failed'), 'gi')
        const regexReset = new RegExp(escapeRegExp('password reset success'), 'gi')
        const failedLogin = await Analytics.countDocuments({ 'event.type': 'action', 'event.info': regexLogin, createdAt: { $gte: yesterday } })
        const passwordReset = await Analytics.countDocuments({ 'event.type': 'action', 'event.info': regexReset, createdAt: { $gte: yesterday } })

        // Get the number of users
        const users = await Analytics.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: yesterday
                    },
                    userid: {
                        $ne: null
                    }
                }
            },
            {
                $group: {
                    _id: { sessionid: "$sessionid" }
                }
            }
        ])

        // Get the number of guests
        const guests = await Analytics.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: yesterday
                    },
                    userid: {
                        $eq: null
                    }
                }
            },
            {
                $group: {
                    _id: { sessionid: "$sessionid" }
                }
            }
        ])

        // Send response to the client
        res.json({
            failedLogin,
            passwordReset,
            users: users.length,
            guests: guests.length
        })

    }
})

// Get the last 10 users that logged in
router.get('/latest', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        // Find the last 10 users that logged in and sort by decending order
        Analytics.find({ 'event.info': 'login success' })
            .populate('userid', ['userid'])
            .sort({ createdAt: -1 }).limit(10)
            .then(events => {
                res.json(events)
            })
    }
})

// Generate analytics report within the date range specified
router.post('/report', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    // Check if user is an admin and if from and to date is available
    else if (!req.body.from || !req.body.to) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        // Set date range
        const fromDate = new Date(new Date(req.body.from).toDateString())
        const toDate = new Date(new Date(req.body.to).toDateString())
        toDate.setDate(toDate.getDate() + 1)

        // Set default userid filter
        let id = { $ne: 'lol' }

        // If there is a filter, get the id of the user
        if (req.body.userid) {
            id = await User.findOne({ userid: req.body.userid })

            id = id ? { $eq: mongoose.Types.ObjectId(id._id) } : { $eq: 'lol' }

        }

        // Get data from database
        // Group data by userid, session, sessiondate
        // Sort by ascending order
        Analytics.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: fromDate,
                        $lt: toDate
                    },
                    userid: id
                }
            },
            {
                $group: {
                    _id: {
                        userid: "$userid",
                        sessionid: "$sessionid",
                        sessionDate: "$sessionDate",
                        ip: "$ip",
                        device: "$device",
                        userAgent: "$userAgent"
                    },
                    events: {
                        $push: {
                            event: "$event",
                            date: "$createdAt"
                        }
                    },
                    geolocation: {
                        $first: "$geolocation"
                    }
                }
            },
            { $sort: { '_id.sessionDate': 1 } },
        ])
            .then(analytics => {
                // Populate the users details in the analytics records
                User.populate(analytics, { path: '_id.userid', select: ['userid'] })
                    .then(analytics => {
                        const anal = []
                        let events = []

                        // Format the data for frontend to display
                        for (let i = 0; i < analytics.length; i++) {
                            events = []
                            for (let j = 0; j < analytics[i].events.length; j++) {
                                events.push({
                                    type: analytics[i].events[j].event.type,
                                    info: analytics[i].events[j].event.info,
                                    date: analytics[i].events[j].date
                                })
                            }

                            // Format for table on frontend
                            anal.push({
                                sessionid: analytics[i]._id.sessionid,
                                sessionDate: analytics[i]._id.sessionDate,
                                user: analytics[i]._id.userid,
                                ip: analytics[i]._id.ip,
                                geolocation: analytics[i].geolocation,
                                device: analytics[i]._id.device,
                                userAgent: analytics[i]._id.userAgent,
                                events
                            })
                        }

                        // Response with both formatted data
                        res.json(anal)
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    }
})

// Generate csv for analytics report within the date range specified
router.post('/csv', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    // Check if user is an admin and if from and to date is available
    else if (!req.body.from || !req.body.to) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        // Set date range
        const fromDate = new Date(new Date(req.body.from).toDateString())
        const toDate = new Date(new Date(req.body.to).toDateString())
        toDate.setDate(toDate.getDate() + 1)

        // Set default userid filter
        let id = { $ne: 'lol' }

        // If there is a filter, get the id of the user
        if (req.body.userid) {
            id = await User.findOne({ userid: req.body.userid })

            id = id ? { $eq: mongoose.Types.ObjectId(id._id) } : { $eq: 'lol' }

        }

        // Get data from database
        // Group data by userid, session, sessiondate
        // Sort by ascending order
        Analytics.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: fromDate,
                        $lt: toDate
                    },
                    userid: id
                }
            },
            {
                $group: {
                    _id: {
                        userid: "$userid",
                        sessionid: "$sessionid",
                        sessionDate: "$sessionDate",
                        ip: "$ip",
                        device: "$device",
                        userAgent: "$userAgent"
                    },
                    events: {
                        $push: {
                            event: "$event",
                            date: "$createdAt"
                        }
                    },
                    geolocation: {
                        $first: "$geolocation"
                    }
                }
            },
            { $sort: { '_id.sessionDate': 1 } },
        ])
            .then(analytics => {
                // Populate the users details in the analytics records
                User.populate(analytics, { path: '_id.userid', select: ['userid'] })
                    .then(analytics => {
                        const csv = []

                        // Format the data for frontend to display
                        for (let i = 0; i < analytics.length; i++) {
                            csv.push({
                                User: analytics[i]._id.userid === null ? 'Guest' : analytics[i]._id.userid.userid,
                                SessionID: analytics[i]._id.sessionid,
                                "Session date": analytics[i]._id.sessionDate,
                                ip: analytics[i]._id.ip,
                                Geolocation: analytics[i].geolocation !== null ? analytics[i].geolocation.regionName + ', ' + analytics[i].geolocation.countryName + ', ' + analytics[i].geolocation.continentName : null,
                                Device: analytics[i]._id.device,
                                "User agent": analytics[i]._id.userAgent,
                            })

                            for (let j = 0; j < analytics[i].events.length; j++) {
                                // Format data to output in a csv file
                                csv.push({
                                    eventTime: analytics[i].events[j].date,
                                    events: analytics[i].events[j].event.type + ' - ' + analytics[i].events[j].event.info
                                })
                            }
                        }

                        // Response with both formatted data
                        res.json(csv)
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    }
})

module.exports = router