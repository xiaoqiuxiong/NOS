const router = require('koa-router')()
const utils = require('../../util')
const Admin = require('../../database/schema/Admin')
router.prefix('/admin')

router.get('/', async (ctx, next) => {
    let admins = await Admin.find().select("-password")
    if (!admins) admins = []
    await ctx.render('admin', { title: '管理员列表', admins, fun: ctx.fun });
})

module.exports = router