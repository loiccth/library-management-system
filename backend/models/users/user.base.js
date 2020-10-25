const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema
const SALT_WORK_FACTOR = 10

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

baseUserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) {
            return cb(err)
        }
        cb(null, isMatch)
    })
}

const User = mongoose.model('User', baseUserSchema)

module.exports = User