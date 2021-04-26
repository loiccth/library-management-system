const mongoose = require('mongoose')
const checkDate = require('../function/checkDate')
const checkHolidays = require('../function/checkHolidays')

beforeAll(done => {
    mongoose.connect(process.env.ATLAS_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
        .catch(() => console.log("MongoDB database connection failed"))
        .then(() => done())
})

afterAll(done => {
    mongoose.connection.close(() => done())
})

describe('Check if date is a public holiday', () => {
    test('Not a public holiday', async done => {
        const result = await checkDate('2021-12-24')

        expect(result).toBe(false)
        done()
    })
    test('A public holiday', async done => {
        const result = await checkDate('2021-12-25')

        expect(result).toBe(true)
        done()
    })
    test('Date is Sunday', async done => {
        const result = await checkDate('2021-04-25')

        expect(result).toBe(true)
        done()
    })
})

describe('Check if date is a public holiday/Sunday and return next working date', () => {
    test('Not a public holiday - return same date', async done => {
        const result = await checkHolidays('2021-12-24')

        expect(result.toISOString()).toBe(new Date('2021-12-24').toISOString())
        done()
    })
    test('A public holiday - return next working day', async done => {
        const result = await checkHolidays('2021-12-25')

        expect(result.toISOString()).toBe(new Date('2021-12-27').toISOString())
        done()
    })
    test('Date is Sunday - return next working day', async done => {
        const result = await checkHolidays('2021-12-26')

        expect(result.toISOString()).toBe(new Date('2021-12-27').toISOString())
        done()
    })
})


