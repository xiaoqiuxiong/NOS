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
                id_: user.id_,
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

// 管理员列表
router.get('/list', async ctx => {
    let page = Number(ctx.query.page || 1)
    const limit = Number(ctx.query.limit || 10)
    let pages = 0
    const keyWords = ctx.query.keyWords
    let regData;
    //不区分大小写
    const reg = new RegExp(keyWords, 'i')
    if (!parseFloat(keyWords)) {
        // 不是数字
        regData = {
            $or: [
                { username: { $regex: reg } }
            ]
        }
    } else {
        regData = {
            $or: [
                { id_: keyWords },
                { username: { $regex: reg } }
            ]
        }
    }
    try {
        const total = await Admin.count(regData)

        if (!utils.isEmpty(total)) {
            const res = {
                code: 2,
                msg: '暂无数据'
            }
            ctx.body = res
            return
        }
        pages = Math.ceil(total / limit)
        page = Math.min(page, pages)
        page = Math.max(page, 1)
        const skip = (page - 1) * limit
        let result = await Admin.find(regData).sort({ id: 1 }).limit(limit).skip(skip).select('-password');
        const res = {
            code: 0,
            msg: '',
            count: total,
            pages: pages,
            data: result
        }
        ctx.body = res
    } catch (err) {
        console.log(err)
        const res = {
            code: 1,
            msg: '网管去放牛了'
        }
        ctx.body = res
    }
});


// 管理员删除
router.get('/del', async ctx => {
    const ids = JSON.parse(ctx.request.query.ids)
    const doc = Admin.remove({ id_: { $in: ids } }).exec()
    if (doc) {
        ctx.body = {
            code: 0,
            msg: '删除成功'
        }
    } else {
        ctx.body = {
            code: 1,
            msg: '删除失败'
        }
    }
})

module.exports = router