const Setting = require('../models/setting.model')

const checkHolidays = async (checkDate) => {
    let holidays = await Setting.findOne({ setting: 'HOLIDAYS' })
    holidays = holidays.options

    let newDate = new Date(checkDate)

    let month = newDate.getMonth() < 10 ? '0' + String(newDate.getMonth() + 1) : newDate.getMonth() + 1
    let date = newDate.getDate() < 10 ? '0' + String(newDate.getDate()) : newDate.getDate()

    while (holidays.includes(`${newDate.getFullYear()}-${month}-${date}`) || newDate.getDay() === 0) {
        newDate.setDate(newDate.getDate() + 1)
        month = newDate.getMonth() < 10 ? '0' + String(newDate.getMonth() + 1) : newDate.getMonth() + 1
        date = newDate.getDate() < 10 ? '0' + String(newDate.getDate()) : newDate.getDate()
    }

    return newDate
}

module.exports = checkHolidays