const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const Analytics = require('../models/analytics.model')
const User = require('../models/users/user.base')
const axios = require('axios')
const secret = process.env.JWT_SECRET

router.post('/', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    const { sessionid, device, userAgent, event } = req.body
    if (!sessionid || !device || !userAgent || !event) return res.status(400).json({ error: 'msgMissingParams' })

    else {
        // Change when push to prod
        let ip = req.connection.remoteAddress

        // let ip = req.headers['x-forwarded-for']
        // ip = ip.split(', ')
        // ip = ip[0]
        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7)
        }

        // Change when push to prod
        ip = ip === '127.0.0.1' || ip === '::1' ? '102.114.39.1' : ip

        Analytics.find({ sessionid: sessionid })
            .then(async session => {
                sessionDate = session.length > 0 ? session[0].sessionDate : new Date()

                if (session.length === 0 || event.info === 'login success') {
                    const geolocationDetails = await axios.post(`http://api.ipstack.com/${ip}?access_key=${process.env.IPSTACK_API}`)

                    const { continent_code, continent_name, country_code, country_name, region_code, region_name, city } = geolocationDetails.data

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

                    newAnalytics.save().then(() => res.sendStatus(200))
                }
            })
    }
})

router.get('/sessions', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setHours(0, 0, 0, 0)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

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

        res.json({
            labels,
            totalData,
            usersData,
            guestsData
        })
    }
})

router.get('/devices', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setHours(0, 0, 0, 0)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

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

                res.json({
                    labels,
                    data
                })
            })
    }
})

router.get('/stats', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000))

        const failedLogin = await Analytics.find({ 'event.type': 'action', 'event.info': 'login failed', createdAt: { $gte: yesterday } })
        const passwordReset = await Analytics.find({ 'event.type': 'action', 'event.info': 'password reset success', createdAt: { $gte: yesterday } })
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
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])

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
                    _id: { sessionid: "$sessionid" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])

        res.json({
            failedLogin: failedLogin.length,
            passwordReset: passwordReset.length,
            users: users.length,
            guests: guests.length
        })

    }
})

router.get('/latest', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        Analytics.find({ 'event.info': 'login success' })
            .populate('userid', ['userid'])
            .sort({ createdAt: -1 }).limit(10)
            .then(events => {
                res.json(events)
            })
    }
})

router.post('/report', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), async (req, res) => {
    if (req.user.memberType !== 'Admin') return res.sendStatus(403)
    else if (!req.body.from || !req.body.to) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        const fromDate = new Date(new Date(req.body.from).toDateString())
        const toDate = new Date(new Date(req.body.to).toDateString())
        toDate.setDate(toDate.getDate() + 1)

        Analytics.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: fromDate,
                        $lt: toDate
                    }
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
            {
                $sort: {
                    _id: 1
                }
            }
        ])
            .then(analytics => {
                User.populate(analytics, { path: '_id.userid', select: ['userid'] })
                    .then(analytics => res.json(analytics))
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    }
})

module.exports = router