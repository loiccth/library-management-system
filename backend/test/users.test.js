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
    }).catch(() => console.log("MongoDB database connection failed"))
        .then(() => done())
})

afterEach(done => {
    mongoose.connection.close(() => done())
})

let tokencookie = null

describe('POST Endpoint for /users/login', () => {
    test('Using correct userid and password', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'admin',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                expect(res.body.userid).toBe('admin')
                tokencookie = res.header['set-cookie']
                done()
            })
    })

    test('Using incorrect userid and password', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'asd',
                password: 'dasd'
            })
            .then(res => {
                expect(res.statusCode).toBe(400)
                done()
            })
    })

    test('Using empty userid and password', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: '',
                password: ''
            })
            .then(res => {
                expect(res.statusCode).toBe(400)
                done()
            })
    })
})

describe('POST Endpoint for /users/register', () => {
    test('Accessing endpoint without logging in', done => {
        request(app)
            .post('/users/register')
            .then(res => {
                expect(res.statusCode).toBe(401)
                done()
            })
    })
    test('Using a non administrator account', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/users/register')
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(403)
                        done()
                    })
            })
    })
    test('Using an administrator account with empty email address field', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'admin',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/users/register')
                    .send({
                        email: ''
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('Using an administrator account with invalid email', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'admin',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/users/register')
                    .send({
                        email: 'abc'
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('Using an administrator account with email already linked with an account', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'admin',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/users/register')
                    .send({
                        email: 'test@udmlibrary.com'
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('Using an administrator account with email not linked to any account', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'admin',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .post('/users/register')
                    .send({
                        email: 'member@udmlibrary.com'
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(201)
                        done()
                    })
            })
    })
})

describe('PATCH Endpoint for /users/ (Update password)', () => {
    test('Accessing endpoint without logging in', done => {
        request(app)
            .patch('/users/')
            .then(res => {
                expect(res.statusCode).toBe(401)
                done()
            })
    })
    test('Submit form with empty fields', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .patch('/users/')
                    .send({
                        oldpassword: '',
                        newpassword: '',
                        confirmpassword: ''
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('New password and confirm password do not match', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .patch('/users/')
                    .send({
                        oldpassword: 'password',
                        newpassword: 'password1',
                        confirmpassword: 'password2'
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('Old password does not match', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .patch('/users/')
                    .send({
                        oldpassword: 'password123',
                        newpassword: 'password1',
                        confirmpassword: 'password1'
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(400)
                        done()
                    })
            })
    })
    test('Old password and new password match', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .patch('/users/')
                    .send({
                        oldpassword: 'password',
                        newpassword: 'password',
                        confirmpassword: 'password'
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(400)
                        done()
                    })
            })

    })
    test('Old password != new password && new password == confirm password', done => {
        request(app)
            .post('/users/login')
            .send({
                userid: 'student',
                password: 'password'
            })
            .then(res => {
                expect(res.statusCode).toBe(200)
                request(app)
                    .patch('/users/')
                    .send({
                        oldpassword: 'password',
                        newpassword: 'password1',
                        confirmpassword: 'password1'
                    })
                    .set('Cookie', res.header['set-cookie'])
                    .then(response => {
                        expect(response.statusCode).toBe(200)
                        done()
                    })
            })

    })
})