const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const Analytics = require('../models/analytics.model')
const axios = require('axios')
const secret = process.env.JWT_SECRET

router.post('/', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    const { sessionid, device, userAgent, events } = req.body
    if (!sessionid || !device || !userAgent || !events) return res.status(400).json({ 'error': 'Missing params' })

    else {
        // Change when push to prod
        let ip = req.connection.remoteAddress

        // let ip = req.headers['x-forwarded-for']
        // ip = ip.split(', ')
        // ip = ip[0]
        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7)
        }

        Analytics.findOne({ sessionid: sessionid })
            .then(async session => {
                if (session) {
                    session.events.push(events)

                    session.save().then(() => res.sendStatus(200))
                }
                else {
                    // Change when push to prod
                    ip = ip === '127.0.0.1' || ip === '::1' ? '102.114.39.1' : ip
                    const geolocationDetails = await axios.post(`http://api.ipstack.com/${ip}?access_key=${process.env.IPSTACK_API}`)

                    const { continent_code, continent_name, country_code, country_name, region_code, region_name, city } = geolocationDetails.data

                    const newAnalytics = new Analytics({
                        sessionid,
                        userid: req.user ? req.user._id : null,
                        guest: req.user ? false : true,
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
                        events: [
                            events
                        ]
                    })

                    newAnalytics.save().then(() => res.sendStatus(200))
                        .catch(err => {
                            if (err.message.includes('sessionid_1 dup key'))
                                Analytics.findOne({ sessionid: sessionid })
                                    .then(session => {
                                        session.events.push(events)

                                        session.save().then(() => res.sendStatus(200))
                                    })
                            else
                                console.log(err)
                        })
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
                    count: { $sum: 1 }
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
                    guest: {
                        $eq: false
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%m/%d/%Y', date: { $add: ['$createdAt', 14400000] } } },
                    count: { $sum: 1 }
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
                    guest: {
                        $eq: true
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%m/%d/%Y', date: { $add: ['$createdAt', 14400000] } } },
                    count: { $sum: 1 }
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
                    totalData[i] = total[j].count
                    break
                }
            }

            for (let k = 0; k < users.length; k++) {
                if (new Date(users[k]._id) - sevenDaysAgo === 0) {
                    usersData[i] = users[k].count
                    break
                }
            }

            for (let l = 0; l < guests.length; l++) {
                if (new Date(guests[l]._id) - sevenDaysAgo === 0) {
                    guestsData[i] = guests[l].count
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
                    count: { $sum: 1 }
                }
            },
        ])
            .then(result => {
                let labels = ['Desktop', 'Tablet', 'Mobile']
                let data = [0, 0, 0]

                for (let i = 0; i < result.length; i++) {
                    if (result[i]._id === 'browser')
                        data[0] = result[i].count
                    else if (result[i]._id === 'tablet')
                        data[1] = result[i].count
                    else if (result[i]._id === 'mobile')
                        data[2] = result[i].count

                }

                res.json({
                    labels,
                    data
                })
            })
    }
})

module.exports = router