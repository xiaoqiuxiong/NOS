const router = require('koa-router')()
const utils = require('../../util')

router.prefix('/apis')
router.get('/', async ctx => {
    ctx.body = '测试'
})

module.exports = router