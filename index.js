//导入模块
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')

// 注册 session 中间件
// 只要注册了 session 中间件，那么，今后只要能访问到 req 这个对象，必然能访问到 req.session
app.use(session({
    secret: 'keyboard cat',//这是加密的钥匙
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000*60*60 }//设置cookie的寿命
}))

//使用模板
app.set('view engin','ejs')
app.set('views','./views')
//注册表单数据中间件
app.use(bodyParser.urlencoded({extended: false}))
//添加虚拟目录
app.use('/node_modules',express.static('./node_modules'))
//导入路由模块
const router = require('./router/router.js')
app.use(router)

app.listen(3001,function(){
    console.log('running at http://127.0.0.1:3001')
})