import restify from 'restify'
import corsMiddleware from 'restify-cors-middleware'
import * as _ from 'lodash'
import console from 'chalk-console'
import validator from 'restify-joi-middleware'
import errors from 'restify-errors'
import mongoose from 'mongoose'
import NodeCache from 'node-cache'
import * as log from 'loglevel'
import messageRoute from "./src/routes/message"
import { PORT, MONGO_OPTIONS } from './configSys'
import loggerMiddleware from './loggerMiddleware'

import socketio from "socket.io"
import userStatus from "./src/dao/userStatus"
import messageDao from "./src/dao/mesage"
import { socketIoDevice } from './src/models/userStatus'
import { messageModel } from './src/models/message'

const _cache = new NodeCache({ stdTTL: 500, checkperiod: 30 })
require('console-group').install()

var server = restify.createServer({
  name: 'devfast-api',
  version: '0.0.1',
  formatters: {
    'application/json': function (req, res, payload) {
      // in formatters, body is the object passed to res.send() NOTE  read: https://github.com/restify/errors/pull/87
      if (payload instanceof Error) {
        const error = payload.body
        return JSON.stringify({
          code: _.get(error, 'code', 'InternalServer'),
          name: payload.name || 'Unknow',
          message: _.get(error, 'message', payload.message),
          ...payload.context
        })
      }
      // for everything else, stringify as normal
      return JSON.stringify(payload)
    }
  }
})


// MARK  global vairables
global._ = _
global.isDev = process.env.NODE_ENV !== 'production'
global._cache = _cache

if (global.isDev) {
  log.setLevel(0)
  /* #region   document */
  // log.info('info-----')
  // log.debug('debug----')
  // log.warn('log-----')
  // log.error('error---')
  // console.log(log.getLevel(), '----')
  /* #endregion */
}

/* MARK  Middleware  */
server.use(loggerMiddleware)
const cors = corsMiddleware({
  origins: ['http://192.168.1.5:3000', '*'], // defaults to ['*']
  //   credentials: true,
  methods: ['GET', 'PUT', 'PATCH', 'DELETE', 'POST', 'OPTIONS'],
  preflightMaxAge: 5, // Optional
  allowHeaders: ['Authorization'],
})
server.pre(cors.preflight)
server.pre(restify.plugins.pre.dedupeSlashes())
server.pre(restify.plugins.pre.sanitizePath())
server.use(cors.actual)
server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.jsonp())
server.use(restify.plugins.gzipResponse())
server.use(restify.plugins.bodyParser())
/* #region  Hướng dẫn sử throttle */
// burst: Số lượng request đồng thời trong 1 giây
// rate : Số lượng request được phục hồi sau mỗi 1 giây
server.use(
  restify.plugins.throttle({
    burst: 10,
    rate: 10,
    ip: true
    // overrides: {
    //   '192.168.1.1': {
    //     rate: 0, // unlimited
    //     burst: 0
    //   }
    // }
  })
)
/* #endregion */

server.use(
  validator({
    joiOptions: {
      convert: true,
      allowUnknown: true,
      abortEarly: false
      // .. all additional joi options
    },
    // changes the request keys validated keysToValidate: ['params', 'body', 'query', 'user', 'headers', 'trailers',
    // 'files'], changes how joi errors are transformed to be returned - no error details are returned in this case
    errorTransformer: (validationInput, joiError) => {
      const tranformError = joiError.details.map(err => {
        const path = err.path.join('.')
        let item = {}
        item.type = err.type
        item.message = `${path} ${err.message}`
        return item
      })
      return new errors.InvalidArgumentError(
        {
          name: 'RouteValidation',
          info: {
            errors: tranformError
          }
        },
        'Validate route fail'
      )
    }
  })
)

// MARK  connect
console.green(`Connecting to mongo ${MONGO_OPTIONS.uri}`)

mongoose
  .connect(MONGO_OPTIONS.uri, {
    // user: MONGO_OPTIONS.user,
    // pass: MONGO_OPTIONS.pass,
    ...MONGO_OPTIONS.db_options
  })
  .catch(error => console.error(error))
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
const db = mongoose.connection

// MARK  Main

db.once('open', () => {
  console.yellow(`connected ${MONGO_OPTIONS.uri} succsesfull`)

  // NOTE  start
  server.listen(PORT, () => {
    console.blue(`Server is listening on port ${PORT}`)

    server.get('/', (req, res) => {
      res.json({ msg: 'Welcome to devfast api' })
    })
    messageRoute.applyRoutes(server, '/message')

    server.post('/createStatusForUser', async (req, res) => {
      const { name, userId } = req.body
      await userStatus.createStatusForUser({ name, userId })
      res.json(200)
    })
    server.get("/getListStatusUser", async (req, res) => {
      let result = await userStatus.getListStatusUser();
      res.send(result)
    })
    var io = socketio.listen(server.server)
    io.on('connection', function (socket) {
      // console.log("connection ne")
      console.log(socket.id, "connect")
      try {
        socket.on('online', async function (msg) {
          console.log(msg, "msg")
          const { userId } = msg;
          let checkIsOnline = await userStatus.CheckOnlineAndUpdateNumberOfDeviceOnline({ userId, socketId: socket.id });
          if (checkIsOnline == false) {
            var data = { userId: msg.userId, status: true, socketId: socket.id }
            await userStatus.updateStatus(data)
            socket.broadcast.emit('user online')
          }
        });
        socket.on('disconnect', async () => {
          console.log(socket.id, "disconnect")
          let check = await userStatus.CheckaUserDisconnectAllDevice(socket.id)
          if (check == true) socket.broadcast.emit('user online')
        });
        // socket.on("send message", async (msg) => {
        //   var { content, senderId, receiverId, senderName, receiverName } = msg;
        //   var msgg = { content, senderId, senderName }
        //   socket.emit(`message ${receiverId}`, msgg);
        //   await messageDao.saveMessage({ senderId, senderName, receiverId, receiverName, content })
        // })

        socket.on("send message", async (msg) => {
          // var { content, senderId, receiverId, senderName, receiverName } = msg;
          // var msgg = { content, senderId, senderName }
          console.log(msg, "msg")
          socket.emit("message", msg);
          // await messageDao.saveMessage({ senderId, senderName, receiverId, receiverName, content })
        })

        socket.on("already read", async (msg) => {
          var { senderId, senderName, receiverId, receiverName } = msg;
          var msgg = { senderId, senderName }
          socket.emit(`read ${receiverId}`, msgg);
          await messageDao.updateReadMessage({ senderId, receiverId })
        })
      } catch (error) {
        console.log(error, "error")
      }


    });


    // MARK ROUTES
  })
})

