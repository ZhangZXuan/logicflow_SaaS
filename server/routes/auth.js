const express = require('express')
const router = express.Router()
const c = require('../controller/authController')

// 注册
router.post('/register', c.register)

// 登录
router.post('/login', c.login)

module.exports = router
