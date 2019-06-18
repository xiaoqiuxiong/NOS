const router = require('koa-router')()
let Admin = require('../../database/schema/Admin')
const jsonwebtoken = require('jsonwebtoken')
const secret = 'xiaoqiuxiong'
router.prefix('/apis/admin')
const passport = require('koa-passport')
const utils = require('../../util')
// 管理员注册
router.post('/add', async ctx => {
    let body = {
        code: 0,
        msg: ''
    }
    let username = ctx.request.body.username
    let password = ctx.request.body.password
    let result = await Admin.findOne({ username })
    if (result) {
        body.code = -1
        body.msg = '用户名已经被使用'
        ctx.body = body
        return false
    }
    let newAdmin = new Admin({
        username,
        password
    })
    result = await newAdmin.save()
    if (result.code) {
        body.code = -1
        body.msg = '注册失败'
    } else {
        body.msg = '注册成功'
    }
    ctx.body = body
})
// 管理员登录
router.post('/login', async ctx => {
    let body = ctx.request.body
    // 调用策略
    await passport.authenticate('local', (err, user, info, status) => {
        if (utils.isEmpty(user)) {
            const userInfo = {
                userid: user._id,
                username: user.username
            }
            ctx.cookies.set('token', new Buffer(JSON.stringify(userInfo)).toString('base64'), { maxAge: 1000 * 60 * 60 * 24 })
            delete userInfo.password
            ctx.cookies.set('userInfo', JSON.stringify(userInfo), { maxAge: 1000 * 60 * 60 * 24 })
            ctx.body = {
                code: 0,
                msg: info
            };
        } else {
            ctx.body = {
                code: 1,
                msg: info
            }
        }
        ctx.login(user)
    })(ctx)
})
// 管理员登录
router.post('/logout', async ctx => {
    ctx.logout()
    ctx.body = {
        code: 0,
        msg: '已经退出登录'
    }
})

module.exports = router