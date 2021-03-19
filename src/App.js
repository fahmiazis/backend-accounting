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
const emailRoute = require('./routes/email')
const dokumenRoute = require('./routes/dokumen')
const depoRoute = require('./routes/depo')
const picRoute = require('./routes/pic')

app.use('/uploads', express.static('assets/documents'))

app.use('/auth', authRoute)
app.use('/user', authMiddleware, userRoute)
app.use('/alasan', authMiddleware, alasanRoute)
app.use('/divisi', authMiddleware, divisiRoute)
app.use('/email', authMiddleware, emailRoute)
app.use('/dokumen', authMiddleware, dokumenRoute)
app.use('/depo', authMiddleware, depoRoute)
app.use('/pic', authMiddleware, picRoute)

app.get('*', (req, res) => {
  response(res, 'Error route not found', {}, 404, false)
})

server.listen(APP_PORT, () => {
  console.log(`App is running on port ${APP_PORT}`)
})
