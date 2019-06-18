const router = require('koa-router')()
router.prefix('/login')

router.get('/', async (ctx, next) => {
    await ctx.render('login', { title: '登录' });
})

module.exports = router