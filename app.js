const Koa = require('koa')
const app = new Koa()
const cors = require('koa2-cors')
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const jwt = require('koa-jwt')
const utils = require('./util')
const passport = require('./authenticator')
const session = require('koa-session')
const registerRouter = require('./routes/access')

// 具体参数我们在后面进行解释
app.use(cors({
    origin: function(ctx) {
        return '*';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))

//配置session的中间件
app.keys = ['fastshop']
app.use(session({
    key: 'koa:fastshop',
    maxAge: 1000 * 60 * 60 * 24,
    overwrite: true,
    httpOnly: false,
    signed: true
}, app))

app.use(passport.initialize())
app.use(passport.session())

app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
    extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 要放在路由模块前面
// Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use(function(ctx, next) {
    return next().catch((err) => {
        if (401 == err.status) {
            ctx.status = 200;
            ctx.body = {
                code: 9999,
                msg: '您还没有登录，请先登录！'
            };
        } else {
            throw err;
        }
    });
});

// 控制接口
// app.use(jwt({
//     secret: 'xiaoqiuxiong',
// }).unless({
//     path: [/^((?!\/apis).)*$/, '/apis/admin/add', '/apis/admin/login', '/apis/admin/logout'],
// }))

// 控制后台
app.use(async (ctx, next) => {
    if (ctx.url.match(/^\/apis/)) {
        if (ctx.url.match(/^\/apis\/admin\/add/) || ctx.url.match(/^\/apis\/admin\/login/)) {
            await next()
        } else {
            if (!ctx.isAuthenticated()) {
                ctx.body = {
                    code: 9999,
                    msg: '您还没有登录，请先登录！'
                }
                return false
            }
            await next()
        }
    } else if (ctx.url.match(/^\/login/) || ctx.url.match(/^\/register/)) {
        ctx.isAuthenticated() ? ctx.redirect('/') : ''
        await next()
    } else {
        !ctx.isAuthenticated() ? ctx.redirect('/login') : ''
        if (!ctx.isAuthenticated()) {
            ctx.redirect('/login')
        } else {
            if (ctx.cookies.get('token')) {
                ctx.token = JSON.parse(new Buffer(ctx.cookies.get('token'), 'base64').toString())
                ctx.userInfo = JSON.parse(ctx.cookies.get('userInfo'))
            }
        }

        await next()
    }

})

app.use(async (ctx, next) => {
    ctx.fun = require('./myFunction')
    await next()
})

// routes
app.use(registerRouter())


// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app