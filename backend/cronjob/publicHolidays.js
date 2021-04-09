const { CronJob } = require('cron')
const Setting = require('../models/setting.model')
const axios = require('axios')

// This function is called everyday at midnight
// It gets all public holidays in Mauritius
// and saves it in the database
const highDemand = new CronJob('0 0 * * *', () => {
    const now = new Date()

    // Get list of holidays fron calendarific
    axios.get(`https://calendarific.com/api/v2/holidays?&api_key=${process.env.HOLIDAY_API_KEY}&country=MU&year=${now.getFullYear()}&type=national`)
        .then(holidays => {

            // Loop through the result and store the dates in an array
            const dates = []
            for (let i = 0; i < holidays.data.response.holidays.length; i++) {
                dates.push(holidays.data.response.holidays[i].date.iso)
            }

            // Find if HOLIDAYS exists in database then modify it
            // else create a new one
            Setting.findOne({ setting: 'HOLIDAYS' })
                .then(setting => {
                    if (setting) {
                        setting.option = dates
                        setting.markModified('options')

                        setting.save().catch(err => console.log(err))
                    }
                    else {
                        // Create new setting
                        const newSetting = new Setting({
                            setting: 'HOLIDAYS',
                            options: dates
                        })

                        newSetting.save().catch(err => console.log(err))
                    }
                })
        })
}, null, true, 'Indian/Mauritius')

module.exports = highDemand