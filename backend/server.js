const app = require('./app')
const mongoose = require('mongoose')
require('dotenv').config()

const port = process.env.PORT

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
    // const expireReservations = require('./cronjob/expireReservations')
    // const highDemand = require('./cronjob/highDemand')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})