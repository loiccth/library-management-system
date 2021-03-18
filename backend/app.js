const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

require('dotenv').config()

const app = express()

// Change when push to prod
// app.use(morgan('combined'))
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/users', require('./routes/users'))
app.use('/books', require('./routes/books'))
app.use('/settings', require('./routes/settings'))
app.use('/analytics', require('./routes/analytics'))

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            'success': false,
            'message': 'Invalid JWT Token'
        })
    }
})

module.exports = app