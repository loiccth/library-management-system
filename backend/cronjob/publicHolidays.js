const { CronJob } = require('cron')
const Setting = require('../models/setting.model')
const axios = require('axios')

const highDemand = new CronJob('0 0 * * *', () => {
    const now = new Date()


    axios.get(`https://calendarific.com/api/v2/holidays?&api_key=${process.env.HOLIDAY_API_KEY}&country=MU&year=${now.getFullYear()}&type=national`)
        .then(holidays => {

            const dates = []
            for (let i = 0; i < holidays.data.response.holidays.length; i++) {
                dates.push(holidays.data.response.holidays[i].date.iso)
            }

            Setting.findOne({ setting: 'HOLIDAYS' })
                .then(setting => {
                    if (setting) {
                        settings.option = dates
                        setting.markModified('options')

                        setting.save().catch(err => console.log(err))
                    }
                    else {
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