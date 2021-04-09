const twilio = require('twilio')

const accountSid = process.env.TWILIO_SID
const authToken = process.env.TWILIO_AUTH

const client = new twilio(accountSid, authToken)

// Function called to send a SMS using Twilio
// It takes two parameters
// The body of the message and the phone number destination
const sendSMS = (msg, number) => {
    client.messages.create({
        body: msg,
        to: number,
        from: process.env.TWILIO_PHONE
    })
        .then(result => console.log(result))
        .catch(err => console.log(err))
}

module.exports = sendSMS

