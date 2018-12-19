//业务模块
//导入mysql数据库模块
const conn = require('../bd/mysql.js')
const moment = require('moment')
const mditor = require("mditor");
const parser = new mditor.Parser()

module.exports = {
    //用户类业务
    getApi:(req,res) => {
        const page = 4
        const size = Number(req.query.page) || 1
        const sql = `select a.id,a.title,a.ctime,u.nickname from article as a
        left join users as u 
        on a.authorId=u.id
        order by a.ctime desc
        limit ${(size-1)*page},${page};
        select count(*) as count from article`
        conn.query(sql,(err,result)=>{
            // console.log(result)
            const totalPage = Math.ceil(result[1][0].count / page)
            res.render('index.ejs',{
                user: req.session.userInfo,
                islogin: req.session.islogin,
                articles:result[0],
                //总页数
                totalPage: totalPage,
                //当前页数
                size:size
            })
        })
    },
    getRegister:(req,res) => {
        res.render('./user/register.ejs',{})
    },
    getLogin:(req,res) => {
        res.render('./user/login.ejs',{})
    },
    postRegister:(req,res) => {
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
    },
    postLogin:(req,res) => {
        const data = req.body
        const sql = 'select * from users where username= ? and password= ?'
        conn.query(sql,[data.username,data.password],(err,result) => {
            if(err) return res.send({msg: '登录失败!',status: 501})
            if(result.length !== 1) return res.send({msg: '用户名或密码错误!',status: 502})
            //把用户登录成功的信息挂载在 session 上
            req.session.userInfo = result[0]
            //把用户登录的结果挂载在 session 上
            req.session.islogin = true
            res.send({msg: '登录成功',status: 200})
        })
    },
    getLogOut:(req,res) =>{
        req.session.destroy(function(err) {
            // 使用 res.redirect 方法，可以让 客户端重新访问 指定的页面
            res.redirect('/')
        })
    },
    //文章类业务
    showArticle:(req,res) =>{
        //判断用户是否登录
        if(!req.session.islogin) return res.redirect('/')
        res.render('./article/add.ejs',{
            user: req.session.userInfo,
            islogin: req.session.islogin
        })
    },
    addArticle:(req,res)=>{
        const data = req.body
        data.ctime = moment().format('YYYY-M-D  HH:mm:ss')
        data.authorId = req.session.userInfo.id
        const sql = 'insert into article set ?'
        conn.query(sql,data,(err,result) =>{
            if(err) return res.send({status: 400,msg: '添加文章出错,请重试!'})
            if(result.affectedRows !== 1) return res.send({status: 402,msg: '添加文章失败!'})
            res.send({status:200,msg:'添加文章成功',userId: result.insertId})
        })
    },
    showArticleDetail:(req,res)=>{
        const id = req.params.id
        const sql = 'select * from article where id = ?'
        conn.query(sql,id,(err,result)=>{
            if(err) return res.send({status: 401,msg: '查询文章出错,请重试'})
            if(result.length !== 1) return res.send({status: 401,msg: '查询文章失败'})
            result[0].content = parser.parse(result[0].content)
            res.render('./article/info.ejs',{
                user:req.session.userInfo,
                islogin: req.session.islogin,
                article: result[0]
            })
        })
    },
    showEditPage:(req,res)=>{
        if(!req.session.islogin) return res.redirect('/login')
        const id = req.params.id
        const sql = 'select * from article where id = ?'
        conn.query(sql,id,(err,result)=>{
            if(err) return res.send({status: 401,msg: '访问文章出错,请重试'})
            if(result.length !== 1) return res.send({status: 401,msg: '访问文章失败'})
            if(result[0].authorId !== req.session.userInfo.id) return res.redirect('/')
            res.render('./article/edit.ejs',{
                user:req.session.userInfo,
                islogin: req.session.islogin,
                article: result[0]
            })
        })
    },
    postEditPage:(req,res)=>{
        const data = req.body
        const sql = 'update article set ? where id=?'
        data.ctime = moment().format('YYYY-M-D  HH:mm:ss')
        conn.query(sql,[data,data.id],(err,result)=>{
            if(err) return res.send({status: 401,msg: '访问文章出错,请重试'})
            if(result.affectedRows !== 1) return res.send({status: 402,msg:'编辑失败,请重试'})
            res.send({status: 200,msg: '编辑成功!',insertId: data.id})
        })
    },
    getShow:(req,res)=>{
        res.render('./article/query.ejs',{
            user:req.session.userInfo,
            islogin: req.session.islogin,
            articles: []
        })
    },
    //搜索功能
    getQuery:(req,res)=>{
        const key = req.params.key || 1
        const sql = `select a.id,a.title,a.ctime,u.nickname from article as a
        left join users as u 
        on a.authorId=u.id where a.title like '%${key}%'`
        conn.query(sql,(err,result)=>{
            if(result.length == 0){
                return res.render('./article/query.ejs',{
                    user:req.session.userInfo,
                    islogin: req.session.islogin,
                    articles: [],
                })
            }
            res.render('./article/query.ejs',{
                user:req.session.userInfo,
                islogin: req.session.islogin,
                articles: result,
                key:key
            })
        })
    }
}

