const mongoose = require('mongoose')
const User = require('./user.base')
const transporter = require('../../config/mail.config')

const Schema = mongoose.Schema

const adminSchema = new Schema()

adminSchema.methods.registerMember = function (udmid, userid, memberType, password, res) {
    const newMember = new User({
        memberType,
        udmid,
        userid,
        password
    })

    newMember.save()
        .then(member => {
            res.json({
                member
            })

            // const mailRegister = {
            //     from: 'noreply@l0ic.com',
            //     to: email,
            //     subject: 'Register password',
            //     text: 'Your password is valid for 24 hours:  ' + password
            // }
            // transporter.sendMail(mailRegister, (err, info) => {
            //     if (err) return console.log(err.message)
            //     console.log(info)
            // })
        })
        .catch(err => console.log(err))
}

const Admin = User.discriminator('Admin', adminSchema)

module.exports = Admin