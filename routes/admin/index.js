const router = require('koa-router')()
const utils = require('../../util')

// 首页
router.get('/', async (ctx, next) => {
    await ctx.render('index', { title: utils.appName, userInfo: ctx.userInfo});
})



module.exports = router