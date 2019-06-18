const router = require('koa-router')()
router.prefix('/register')

router.get('/', async (ctx, next) => {
    await ctx.render('register', { title: '注册' });
})

module.exports = router