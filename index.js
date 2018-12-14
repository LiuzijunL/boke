//导入模块
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const moment = require('moment')
//创建mysql数据库连接对象
const mysql = require('mysql')
const conn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'blog'
})
//使用模板
app.set('view engin','ejs')
app.set('views','./views')
//注册表单数据中间件
app.use(bodyParser.urlencoded({extended: false}))
//添加虚拟目录
app.use('/node_modules',express.static('./node_modules'))

app.get('/',(req,res) => {
    res.render('index.ejs',{})
})

app.get('/register',(req,res) => {
    res.render('./user/register.ejs',{})
})

app.get('/login',(req,res) => {
    res.render('./user/login.ejs',{})
})
//注册功能
app.post('/register',(req,res) => {
    //获取客户提交过来的表单信息
    const data = req.body
    //判断是否数据为空
    if(data.username.trim() === "" || data.password.trim() ==="" || data.nickname.trim() ==="") return res.send({status: 500,msg: '提交数据不能为空!'})
    //查询用户名是否重复
    const sql1 = 'select count(*) as count from users where username= ?'
    conn.query(sql1,data.username,(err,result) => {
        if(err) return res.send({status: 400, msg: '操作有误,请重试!'})
        if(result[0].count !== 0) return res.send({msg: '用户名重复,请重新输入!',status: 501})
        //执行注册用户名的操作
        data.ctime = moment().format('YYYY-M-D  HH:mm:ss');
        const sql2 = 'insert into users set ?'
        conn.query(sql2,data,(err,result) => {
            if(err) return res.send({msg: '注册失败!',status: 401})
            res.send({status: 200,msg:'注册成功!'})
        })
    })
})
//登录功能
app.post('/login',(req,res) => {
    const data = req.body
    const sql = 'select * from users where username= ? and password= ?'
    conn.query(sql,[data.username,data.password],(err,result) => {
        console.log(result)
        if(err) return res.send({msg: '登录失败!',status: 501})
        if(result.length !== 1) return res.send({msg: '用户名或密码错误!',status: 502})
        res.send({msg: '登录成功',status: 200})
    })
})

app.listen(3001,function(){
    console.log('running at http://127.0.0.1:3001')
})