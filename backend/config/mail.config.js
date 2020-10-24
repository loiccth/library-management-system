const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    port: 587,
    host: process.env.MAIL_HOST,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
})

module.exports = transporter