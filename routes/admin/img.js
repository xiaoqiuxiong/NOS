const router = require('koa-router')()
const utils = require('../../util')
const Admin = require('../../database/schema/Admin')
router.prefix('/admin')

router.get('/', async (ctx, next) => {
    await ctx.render('admin/list', { title: '管理员列表', fun: ctx.fun });
})

router.get('/detail/:id_', async (ctx, next) => {
    if (!ctx.params.id_) {
        await ctx.render('error', { title: '网页找不到了' });
        return false
    }
    const doc = await Admin.findOne({ id_: ctx.params.id_ }).select("-password")
    if (!doc) {
        await ctx.render('error', { title: '网页找不到了' });
        return false
    }
    await ctx.render('admin/detail', { title: '管理员详情', adminInfo: doc, fun: ctx.fun });
})


module.exports = router