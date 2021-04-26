const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')

jest.mock('nodemailer')

beforeEach(done => {
    mongoose.connect(process.env.ATLAS_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
        .catch(() => console.log("MongoDB database connection failed"))
        .then(() => done())
})

afterEach(done => {
    mongoose.connection.close(() => done())
})

describe('POST Endpoint for /books/add_single', () => {
    test('Accessing endpoint without logging in', done => {
        request(app)
            .post('/books/add_single')
            .then(res => {
                expect(res.statusCode).toBe(401)
                done()
            })
    })
    test('Using a non librarian account', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/add_single')
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(403)
                        done()
                    })
            })
    })
    test('Using a librarian account with empty fields', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/add_single')
                    .send({
                        APIValidation: true,
                        location: '',
                        campus: '',
                        isbn: '',
                        noOfCopies: ''
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('Using a librarian account with correct fields and using API validation', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/add_single')
                    .send({
                        APIValidation: true,
                        location: "Pam1",
                        campus: "pam",
                        isbn: "0596554877",
                        noOfCopies: 1
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(201)
                        done()
                    })
            })
    })
    test('Using a librarian account with correct fields and without API validation', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/add_single')
                    .send({
                        APIValidation: false,
                        title: 'test',
                        authors: 'test',
                        isbn: '0596554877',
                        publisher: 'test',
                        publishedDate: '01/01/2020',
                        category: 'test',
                        description: 'this is a test',
                        noOfPages: 1,
                        location: 'Pam1',
                        campus: 'pam',
                        noOfCopies: 1
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(201)
                        done()
                    })
            })
    })
})

describe('POST Endpoint for /books/reserve/:bookid', () => {
    test('Accessing endpoint without logging in', done => {
        request(app)
            .post('/books/reserve/604859448316f82664f50547')
            .then(res => {
                expect(res.statusCode).toBe(401)
                done()
            })
    })
    test('Using an account with invalid bookid', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/reserve/604859448316f82664f50420')
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(404)
                        done()
                    })
            })
    })
    test('Using an account with valid bookid', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/reserve/604859448316f82664f50547')
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(201)
                        done()
                    })
            })
    })
    test('Using an account to reserve same book more than once', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/reserve/604859448316f82664f50547')
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(400)
                        done()
                    })
            })
    })
})

describe('PATCH Endpoint for /books/cancel_reservation/:bookid', () => {
    test('Accessing endpoint without logging in', done => {
        request(app)
            .patch('/books/cancel_reservation/604859448316f82664f50547')
            .then(res => {
                expect(res.statusCode).toBe(401)
                done()
            })
    })
    test('Using an account with invalid bookid', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .patch('/books/cancel_reservation/604859448316f82664f50420')
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(404)
                        done()
                    })
            })
    })
    test('Using an account with valid bookid and no reservation', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .patch('/books/cancel_reservation/5fc1eaaa4989eb0da4c1d02f')
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(404)
                        done()
                    })
            })
    })
    test('Using an account with valid bookid and reservation', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .patch('/books/cancel_reservation/604859448316f82664f50547')
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(200)
                        done()
                    })
            })
    })
})

describe('POST Endpoint for /books/issue', () => {
    test('Accessing endpoint without logging in', done => {
        request(app)
            .post('/books/issue')
            .then(res => {
                expect(res.statusCode).toBe(401)
                done()
            })
    })
    test('Using a non librarian account', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/issue')
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(403)
                        done()
                    })
            })
    })
    test('Using a librarian account with no data sent', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/issue')
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('Using a librarian account with invalid isbn', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/issue')
                    .send({
                        isbn: '1234567890',
                        userid: '6047585db8bbb30369e73774'
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(404)
                        expect(response.body.message).toBeTruthy()
                        done()
                    })
            })
    })
    test('Using a librarian account with invalid userid', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/issue')
                    .send({
                        isbn: '0000000000',
                        userid: '6047585db8bbb30369e73700'
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(404)
                        expect(response.body.message).toBeTruthy()
                        done()
                    })
            })
    })
    test('Using a librarian account with correct userid and isbn', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/issue')
                    .send({
                        isbn: '0000000000',
                        userid: '6047585db8bbb30369e73774'
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(201)
                        expect(response.body.message).toBeTruthy()
                        done()
                    })
            })
    })
})

describe('POST Endpoint for /books/renew/:borrowid', () => {
    test('Accessing endpoint without logging in', done => {
        request(app)
            .post('/books/renew/')
            .then(res => {
                expect(res.statusCode).toBe(401)
                done()
            })
    })
    test('Using an account with an invalid borrowid', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/renew/asdasdasd')
                    .then(res => {
                        expect(res.statusCode).toBe(404)
                        done()
                    })
            })
    })
    test('Using an account to renew high demand book with valid borrowid', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/renew/5fc5fadb64341224d80ad811')
                    .then(res => {
                        expect(res.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('Using an account with a valid borrowid and maximum renew', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/renew/5fc5fadb64341224d80ad811')
                    .then(res => {
                        expect(res.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('Using an account with a valid borrowid and has not reached max renew', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/renew/5fc5fadb64341224d80ad811')
                    .then(res => {
                        expect(res.statusCode).toBe(200)
                        done()
                    })
            })
    })
})

describe('POST Endpoint for /books/return_book', () => {
    test('Accessing endpoint without logging in', done => {
        request(app)
            .post('/books/return_book/')
            .send({
                userid: 'admin',
                isbn: '0201539926',
                campus: 'rhill'
            })
            .then(res => {
                expect(res.statusCode).toBe(401)
                done()
            })
    })
    test('Using a non librarian account', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'admin',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/return_book/')
                    .send({
                        userid: 'admin',
                        isbn: '0201539926',
                        campus: 'rhill'
                    })
                    .then(res => {
                        expect(res.statusCode).toBe(403)
                        done()
                    })
            })
    })
    test('Using a librarian account with empty fields', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/return_book/')
                    .send({
                        userid: '',
                        isbn: '',
                        campus: ''
                    })
                    .then(res => {
                        expect(res.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('Using a librarian account with invalid userid', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/return_book/')
                    .send({
                        userid: 'lolxd',
                        isbn: '0201539926',
                        campus: 'rhill'
                    })
                    .then(res => {
                        expect(res.statusCode).toBe(404)
                        done()
                    })
            })
    })
    test('Using a librarian account with invalid isbn', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/return_book/')
                    .send({
                        userid: 'admin',
                        isbn: '02015asdasdasd',
                        campus: 'rhill'
                    })
                    .then(res => {
                        expect(res.statusCode).toBe(404)
                        done()
                    })
            })
    })
    test('Using a librarian account with correct values but wrong campus', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/return_book/')
                    .send({
                        userid: 'admin',
                        isbn: '0201539926',
                        campus: 'pam'
                    })
                    .then(res => {
                        expect(res.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('Using a librarian account with correct values and right campus', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'librarian',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/books/return_book/')
                    .send({
                        userid: 'admin',
                        isbn: '0201539926',
                        campus: 'rhill'
                    })
                    .then(res => {
                        expect(res.statusCode).toBe(200)
                        done()
                    })
            })
    })
})