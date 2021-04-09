const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

require('dotenv').config()

const app = express()

// Check env and set origin
if (process.env.NODE_ENV === 'production') {
    app.use(cors({ credentials: true, origin: 'https://udmlibrary.com' }))
}
else
    app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(morgan('tiny'))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Import routes
app.use('/users', require('./routes/users'))
app.use('/books', require('./routes/books'))
app.use('/settings', require('./routes/settings'))
app.use('/analytics', require('./routes/analytics'))
app.use('/posts', require('./routes/posts'))

// Middleware to check if jsonwebtoken is valid or not
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            'success': false,
            'error': 'Invalid JWT Token'
        })
    }
})

module.exports = app