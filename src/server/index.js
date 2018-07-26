import path from 'path'

import Koa from 'koa'
import logger from 'koa-logger'
import koaBody from 'koa-body'
import session from 'koa-session'
import Router from 'koa-router'
import views from 'koa-views'

const app = new Koa()

// Real ip get
app.proxy = true

// koa-session config
app.keys = ['secretSessionKey']
app.use(session({
  key: 'koa:sess',
  maxAge: 1200000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
}, app))

app.use(logger())
app.use(koaBody())

// views
const render = views(path.join(__dirname), {
  extension: 'ejs',
})
app.use(render)

// router
const router = new Router()
router.get('/', async (ctx) => {
  await ctx.render('index', { title: 'hello koa!' })
})
app.use(router.routes())

app.listen(process.env.port || 8080, () => console.log(`server started http://localhost:${process.env.port || 8080}`))

export default app

// 프로그램 실행 환경 변수 설정
process.env.NODE_ENV = process.env.NODE_ENV && (process.env.NODE_ENV).trim().toLowerCase() === 'development' ? 'development' : 'production'

// 프로세스 실행 시간 기준으로 cache 갱신
global.cache = (new Date()).valueOf().toString()
