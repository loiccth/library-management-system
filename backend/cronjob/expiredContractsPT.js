const { CronJob } = require('cron')
const Staff = require('../models/udm/staff.model')
const User = require('../models/users/user.base')
const transporter = require('../config/mail.config')
const sendSMS = require('../function/sendSMS')

// This function will be called everyday at midnight
// It suspends all PT staffs' account that their contract expired
// It will send a notification to the members
const expiredContracts = new CronJob('0 0 * * *', () => {
    const now = new Date()

    // Finds all staff that their contract expired
    Staff.find({ staffType: 'pt', contractEndDate: { $lt: now } })
        .then(staffs => {
            // Loop through the list of staffs and mark their account as suspended
            for (let i = 0; i < staffs.length; i++) {
                User.findOne({ udmid: staffs[i]._id, status: 'active' })
                    .then(user => {
                        if (user) {
                            user.status = suspended

                            // Save member's account after updating status
                            user.save().catch(err => console.log(err))

                            const mailRegister = {
                                from: 'no-reply@udmlibrary.com',
                                to: staffs[i].email,
                                subject: 'Account shutdown',
                                text: `Your account with MemberID ${user.userid} has been suspended because your contract ended on ${staffs[i].contractEndDate}`
                            }

                            // Send email notification
                            transporter.sendMail(mailRegister, (err, info) => {
                                if (err) return res.status(500).json({ error: 'msgUnexpectedError' })
                            })

                            // Send SMS notification
                            sendSMS(`Your account with MemberID ${user.userid} has been suspended because your contract ended on ${staffs[i].contractEndDate}`,
                                `+230${staffs[i].phone}`)
                        }
                    })
            }
        })
}, null, true, 'Indian/Mauritius')

module.exports = expiredContracts