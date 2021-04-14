const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth')

// aplicando o middleware ao router
router.use(authMiddleware)

router.get('/', (req,res) => {
    res.send({ ok: true, user: req.userId}) // userid está vindo do middlewares/auth que poderá ser usado em um pedido de alteração de senha.
})

module.exports = app => app.use('/projects', router)