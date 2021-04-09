const { CronJob } = require('cron')
const Book = require('../models/book.model')

// This function is called everyday at midnight
// It will mark a book as high demand if it has more 
// reservations than number of copies
const highDemand = new CronJob('0 0 * * *', () => {
    // Get all book in database
    Book.find()
        .then(books => {
            for (let i = 0; i < books.length; i++) {
                // Checks if reservation length > number of copies
                books[i].isHighDemand = books[i].reservation.length > books[i].copies.length ? true : false
                // Save in database
                books[i].save().catch(err => console.log(err))
            }
        })
}, null, true, 'Indian/Mauritius')

module.exports = highDemand