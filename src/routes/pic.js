const route = require('express').Router()
const pic = require('../controllers/pic')

route.post('/add', pic.addPic)
route.get('/get', pic.getPic)
route.patch('/update/:id', pic.updatePic)
route.delete('/delete/:id', pic.deletePic)
route.get('/detail/:id', pic.getDetailPic)

module.exports = route
