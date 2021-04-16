const { CronJob } = require('cron')
const Borrow = require('../models/transactions/borrow.model')
const transporter = require('../config/mail.config')
const sendSMS = require('../function/sendSMS')

// This function will be called everyday at 8:00 AM
// It will send notifications to all borrowers that their due date is with in 2 days
const dueNotifications = new CronJob('0 8 * * *', () => {
    // Get today's date and today + 2 days date
    const now = new Date()
    const nowPlus2Days = new Date(now)
    nowPlus2Days.setDate(nowPlus2Days.getDate() + 2)

    // Get all borrow transactions within these 2 dates that are still active
    Borrow.find({ dueDate: { $gt: now, $lt: nowPlus2Days }, status: 'active' })
        .populate({ path: 'userid', select: 'userid', populate: { path: 'udmid', select: ['email', 'phone'] } })
        .populate('bookid', ['title'])
        .then(borrows => {
            // Loop through list of borrowers
            for (let i = 0; i < borrows.length; i++) {
                const mailRegister = {
                    from: 'no-reply@udmlibrary.com',
                    to: borrows[i].userid.udmid.email,
                    subject: 'Book due soon',
                    text: `Your book titled ${borrows[i].bookid.title} is due on ${borrows[i].dueDate}.`
                }

                // Send email reminder to the member
                transporter.sendMail(mailRegister, (err, info) => {
                    if (err) return res.status(500).json({ error: 'msgUnexpectedError' })
                })

                // Send SMS reminder to the member
                sendSMS(`Your book titled ${borrows[i].bookid.title} is due on ${borrows[i].dueDate}.`, `+230${borrows[i].userid.udmid.phone}`)
            }
        })


}, null, true, 'Indian/Mauritius')

module.exports = dueNotifications