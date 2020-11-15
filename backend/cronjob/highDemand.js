const { CronJob } = require('cron')
const Book = require('../models/book.model')

const highDemand = new CronJob('0 0 * * *', () => {
    Book.find()
        .then(books => {
            for (let i = 0; i < books.length; i++) {
                books[i].isHighDemand = books[i].reservation.length > books[i].copies.length ? true : false
                books[i].save().catch(err => console.log(err))
            }
        })
}, null, true, 'Indian/Mauritius')

module.exports = highDemand