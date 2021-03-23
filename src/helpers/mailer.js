const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: '',
  secure: false,
  port: ,
  auth: {
    user: '',
    pass: ''
  },
  tls: {
    rejectUnauthorized: false
  }
})

module.exports = transporter
