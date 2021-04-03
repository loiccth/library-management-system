const { CronJob } = require('cron')
const Staff = require('../models/udm/staff.model')
const User = require('../models/users/user.base')
const twilio = require('twilio')
const transporter = require('../config/mail.config')


const highDemand = new CronJob('* * * * *', () => {
    const now = new Date()

    Staff.find({ staffType: 'pt', contractEndDate: { $lt: now } })
        .then(staffs => {
            if (staffs.length > 0) {
                for (let i = 0; i < staffs.length; i++) {
                    User.findOne({ udmid: staffs[i]._id, status: 'active' })
                        .then(user => {
                            if (user) {
                                user.status = suspended

                                user.save().catch(err => console.log(err))

                                const mailRegister = {
                                    from: 'no-reply@udmlibrary.com',
                                    to: staffs[i].email,
                                    subject: 'Account shutdown',
                                    text: `Your account with MemberID ${user.userid} has been suspended because your contract ended on ${staffs[i].contractEndDate}`
                                }

                                transporter.sendMail(mailRegister, (err, info) => {
                                    if (err) return res.status(500).json({ error: 'msgUserRegistrationUnexpectedError' })
                                })

                                const accountSid = process.env.TWILIO_SID
                                const authToken = process.env.TWILIO_AUTH

                                const client = new twilio(accountSid, authToken)

                                client.messages.create({
                                    body: `Your account with MemberID ${user.userid} has been suspended because your contract ended on ${staffs[i].contractEndDate}`,
                                    to: `+230${staffs[i].phone}`,
                                    from: process.env.TWILIO_PHONE
                                })
                                    .catch(err => {
                                        console.log(err)
                                    })
                            }
                        })
                }
            }
        })
}, null, true, 'Indian/Mauritius')

module.exports = highDemand