const router = require('koa-router')()
const utils = require('../../util')
router.prefix('/welcome')

// 欢迎页
router.get('/', async (ctx, next) => {
    await ctx.render('welcome', { title: utils.appName, userInfo: ctx.userInfo });
})

module.exports = router