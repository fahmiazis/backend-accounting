const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const response = require('./helpers/response')

const app = express()
const server = require('http').createServer(app)

const { APP_PORT } = process.env

app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())

const authMiddleware = require('./middleware/auth')

const userRoute = require('./routes/user')
const authRoute = require('./routes/auth')
const alasanRoute = require('./routes/alasan')
const divisiRoute = require('./routes/divisi')

app.use('/auth', authRoute)
app.use('/user', authMiddleware, userRoute)
app.use('/alasan', authMiddleware, alasanRoute)
app.use('/divisi', authMiddleware, divisiRoute)

app.get('*', (req, res) => {
  response(res, 'Error route not found', {}, 404, false)
})

server.listen(APP_PORT, () => {
  console.log(`App is running on port ${APP_PORT}`)
})
