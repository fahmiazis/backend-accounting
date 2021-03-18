const route = require('express').Router()
const email = require('../controllers/email')

route.post('/add', email.addEmail)
route.get('/get', email.getEmail)
route.patch('/update/:id', email.updateEmail)
route.get('detail/:id', email.getDetailEmail)
route.delete('delete/:id', email.deleteEmail)

module.exports = route
