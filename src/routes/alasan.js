const route = require('express').Router()
const alasan = require('../controllers/alasan')

route.post('/create', alasan.createAlasan)
route.patch('/update/:id', alasan.updateAlasan)
route.delete('/delete/:id', alasan.deleteAlasan)
route.get('/get', alasan.getAlasan)
route.get('/detail/:id', alasan.getDetailAlasan)

module.exports = route
