const { CronJob } = require('cron')
const Borrow = require('../models/transactions/borrow.model')
const twilio = require('twilio')
const transporter = require('../config/mail.config')

const dueNotifications = new CronJob('0 8 * * *', () => {
    const now = new Date()
    const nowPlus2Days = new Date(now)
    nowPlus2Days.setDate(nowPlus2Days.getDate() + 2)

    Borrow.find({ dueDate: { $gt: now, $lt: nowPlus2Days }, status: 'active' })
        .populate({ path: 'userid', select: 'userid', populate: { path: 'udmid', select: ['email', 'phone'] } })
        .populate('bookid', ['title'])
        .then(borrows => {
            if (borrows.length !== 0) {
                for (let i = 0; i < borrows.length; i++) {
                    const mailRegister = {
                        from: 'no-reply@udmlibrary.com',
                        to: borrows[i].userid.udmid.email,
                        subject: 'Account shutdown',
                        text: `Your book titled ${borrows[i].bookid.title} is due on ${borrows[i].dueDate}.`
                    }

                    transporter.sendMail(mailRegister, (err, info) => {
                        if (err) return res.status(500).json({ error: 'msgUnexpectedError' })
                    })

                    const accountSid = process.env.TWILIO_SID
                    const authToken = process.env.TWILIO_AUTH

                    const client = new twilio(accountSid, authToken)

                    client.messages.create({
                        body: `Your book titled ${borrows[i].bookid.title} is due on ${borrows[i].dueDate}.`,
                        to: `+230${borrows[i].userid.udmid.phone}`,
                        from: process.env.TWILIO_PHONE
                    })
                        .catch(err => {
                            console.log(err)
                        })
                }
            }
        })


}, null, true, 'Indian/Mauritius')

module.exports = dueNotifications