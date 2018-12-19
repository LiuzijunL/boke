//路由模块
const express = require('express')
const router = express.Router()

const crt = require('../controller/controller.js')

//用户类路由
router.get('/',crt.getApi)

router.get('/register',crt.getRegister)

router.get('/login',crt.getLogin)
//注册功能
router.post('/register',crt.postRegister)
//登录功能
router.post('/login',crt.postLogin)
//注销功能
router.get('/logOut',crt.getLogOut)

//文章类路由
router.get('/article/add',crt.showArticle)

router.post('/article/add',crt.addArticle)

router.get('/article/info/:id',crt.showArticleDetail)

router.get('/article/edit/:id',crt.showEditPage)

router.post('/article/edit',crt.postEditPage)

router.get('/article/query',crt.getShow)

router.get('/article/query/:key',crt.getQuery)

module.exports = router