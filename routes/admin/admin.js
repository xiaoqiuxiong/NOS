const router = require('koa-router')()
const utils = require('../../util')
router.prefix('/admin')

router.get('/', async (ctx, next)=> {
   await ctx.render('admin', { title: '管理员列表'});
})

module.exports = router