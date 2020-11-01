const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken');
const generator = require('generate-password')
const transporter = require('../../config/mail.config')

const Schema = mongoose.Schema
const SALT_WORK_FACTOR = 10
const secret = process.env.JWT_SECRET;

const baseOptions = {
    discriminatorKey: 'memberType',
    collection: 'members'
}

const baseUserSchema = new Schema({
    udmid: { type: Schema.Types.ObjectId, ref: 'UDM', required: true, unique: true },
    userid: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    temporaryPassword: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, default: Date() },
    updatedOn: { type: Date }
}, baseOptions)


baseUserSchema.pre('save', function (next) {
    let user = this;

    if (!user.isModified('password')) return next()

    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err)

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err)

            user.password = hash
            next()
        })
    })
})

baseUserSchema.methods.login = function (candidatePassword, email, phone, res) {
    bcrypt.compare(candidatePassword, this.password)
        .then((result) => {
            if (result) {
                const { _id, userid, memberType, temporaryPassword } = this
                const token = jsonwebtoken.sign({
                    _id,
                    userid,
                    email,
                    phone,
                    memberType,
                    temporaryPassword
                }, secret, { expiresIn: '7d' })

                res.cookie('jwttoken', token, {
                    expires: new Date(Date.now() + 604800000),
                    secure: false,
                    httpOnly: true,
                    sameSite: 'strict'
                })

                res.cookie('user', JSON.stringify({ isLoggedIn: true, _id, userid, email, phone, memberType, temporaryPassword }), {
                    expires: new Date(Date.now() + 604800000),
                    secure: false,
                    httpOnly: false,
                    sameSite: 'strict'
                })

                res.json({
                    _id,
                    userid,
                    email,
                    phone,
                    memberType,
                    temporaryPassword
                })
            }
            else {
                res.status(403).json({
                    'error': 'Invalid userid or password'
                })
            }
        })
        .catch(err => { throw err })
}

baseUserSchema.methods.logout = function (res) {
    res.clearCookie('jwttoken')
    res.clearCookie('user')
    res.sendStatus(200)
}

baseUserSchema.methods.changePassword = function (oldPassword, newPassword, res) {
    bcrypt.compare(oldPassword, this.password)
        .then(result => {
            if (result) {
                this.password = newPassword

                this.save()
                    .then(() => res.sendStatus(200))
                    .catch(err => { throw err })
            }
            else {
                res.sendStatus(403)
            }
        })
}

baseUserSchema.methods.resetPassword = function (res) {
    const pwd = generator.generate({ length: 10, numbers: true })
    this.password = pwd
    this.temporaryPassword = true

    console.log(pwd)

    this.save()
        .then(() => {
            res.sendStatus(200)

            // const mailForgotPassword = {
            //     from: 'noreply@l0ic.com',
            //     to: email,
            //     subject: 'Forgot password',
            //     text: 'Your new password is valid for 24 hours:  ' + pwd
            // }
            // transporter.sendMail(mailForgotPassword, (err, info) => {
            //     if (err) return console.log(err.message)
            //     console.log(info)
            // })
        })
        .catch(err => { throw err })
}

const User = mongoose.model('User', baseUserSchema)

module.exports = User