const Setting = require('../models/setting.model')

// This function takes a date as parameter
// It will loop through a while loop until it finds a date that is not
// a public holiday or a Sunday then return the date
const checkHolidays = async (checkDate) => {
    let holidays = await Setting.findOne({ setting: 'HOLIDAYS' })
    holidays = holidays.options

    let newDate = new Date(checkDate)

    let month = newDate.getMonth() < 10 ? '0' + String(newDate.getMonth() + 1) : newDate.getMonth() + 1
    let date = newDate.getDate() < 10 ? '0' + String(newDate.getDate()) : newDate.getDate()

    while (holidays.includes(`${newDate.getFullYear()}-${month}-${date}`) || newDate.getDay() === 0) {
        // Increment date by 1 day
        newDate.setDate(newDate.getDate() + 1)
        month = newDate.getMonth() < 10 ? '0' + String(newDate.getMonth() + 1) : newDate.getMonth() + 1
        date = newDate.getDate() < 10 ? '0' + String(newDate.getDate()) : newDate.getDate()
    }

    return newDate
}

module.exports = checkHolidays