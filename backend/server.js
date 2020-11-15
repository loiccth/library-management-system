const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const morgan = require('morgan')

require('dotenv').config()

const app = express()
const port = process.env.PORT

app.use(morgan('combined'))
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const uri = process.env.ATLAS_URI
mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).catch(() => console.log("MongoDB database connection failed"))
const connection = mongoose.connection
connection.once('open', () => {
    console.log("MongoDB database connection established successfully")
    const expireReservations = require('./cronjob/expireReservations')
    const highDemand = require('./cronjob/highDemand')
})

app.use('/users', require('./routes/users'))
app.use('/books', require('./routes/books'))

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            'success': false,
            'message': 'Invalid JWT Token'
        })
    }
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})