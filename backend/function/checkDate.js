const Setting = require('../models/setting.model')

// This function takes a date as parameter and verifies if it is a public
// holiday from the database. Returns true if it is a public holiday else
// returns false
const checkDate = async (checkDate) => {
    let holidays = await Setting.findOne({ setting: 'HOLIDAYS' })
    holidays = holidays.options

    let newDate = new Date(checkDate)

    let month = newDate.getMonth() < 10 ? '0' + String(newDate.getMonth() + 1) : newDate.getMonth() + 1
    let date = newDate.getDate() < 10 ? '0' + String(newDate.getDate()) : newDate.getDate()

    if (holidays.includes(`${newDate.getFullYear()}-${month}-${date}`) || newDate.getDay() === 0) {
        return true
    }
    return false
}

module.exports = checkDate