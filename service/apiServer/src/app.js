import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'
import cookeParser from 'cooke-parser'

import setting from './setting/index.js'

const asocial = {
  setting,
}
const a = asocial

const _getDefaultRouter = () => {
  const expressRouter = express.Router()

  const appPath = `${path.dirname(new URL(import.meta.url).pathname)}/`
  expressRouter.use(express.static(appPath + a.setting.getValue('static.PUBLIC_STATIC_DIR'), { index: 'index.html', extensions: ['html'] }))

  expressRouter.use(bodyParser.urlencoded({ extended: true }))
  expressRouter.use(bodyParser.json())
  expressRouter.use(cookieParser())

  return expressRouter
}

const _getFunctionRouter = () => {
  const expressRouter = express.Router()
  return expressRouter
}

const _getErrorRouter = () => {
  const expressRouter = express.Router()

  expressRouter.get('*', (req, res) => {
    res.status(404)
    return res.end('not found')
  })

  return expressRouter
}

const startServer = ({ app, port }) => {
  app.listen(port, () => {
    console.log(`listen to port: ${port}`)
  })
}

const init = () => {
  dotenv.config()
  a.setting.init({ env: process.env })
}

const main = () => {
  a.app.init()
  const expressApp = express()
  expressApp.disable('x-powered-by')

  expressApp.use(_getDefaultRouter())

  expressApp.use(_getFunctionRouter())

  expressApp.use(_getErrorRouter())

  startServer({ app: expressApp, port: a.setting.getValue('server.SERVER_PORT') })
}

const app = {
  init,
  main,
}
asocial.app = app

main()

export default app

