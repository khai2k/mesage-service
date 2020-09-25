/* eslint-disable no-unused-expressions */
import logger from 'restify-logger'
import chalk from 'chalk'
import * as _ from 'lodash'

logger.token('user', function(req) {
  return ((req.user && req.user.Email) || '???') + ':'
})

logger.token('message', function(req, res) {
  // if (res._body && res._body.toJSON) return res._body.toJSON().message
  return `'${_.result(res, '_body.toJSON.message', '')}' ${JSON.stringify(_.result(res, '_body.context'))}`
})

logger.token('code', function(req, res) {
  // if (res._body && res._body.toJSON) return res._body.toJSON().code
  return _.result(res, '_body.toJSON.code', '')
})

logger.token('pid', (req, res) => {
  return 'pid:' + process.pid
})

const loggerMiddleware = logger(
  function(tokens, req, res) {
    const _INFO = [
      chalk.hex('#ff4757').bold(tokens['code'](req, res)),
      chalk.hex('#f78fb3').bold(tokens['message'](req, res)),
      chalk.hex('#34ace0').bold(tokens['pid'](req, res))
    ]

    let _type = 'Success'
    let _typeMess = chalk.hex('#ff4757').bold('🍄   Success --> ')
    let _info = []

    if (res.statusCode >= 400 && res.statusCode < 500) {
      _type = 'Warn'
      _typeMess = chalk.hex('#ffbb33').bold('⚠️   Warn --> ')
      _info = _INFO
    } else if (res.statusCode >= 500 || res.err) {
      _type = 'Error'
      _typeMess = chalk.hex('#ff4757').bold('❌   Error --> ')
      _info = _INFO
    }

    return [
      '',
      _typeMess,
      chalk.hex('#34ace0').bold(tokens.method(req, res)),
      chalk.hex('#ffb142').bold(tokens.status(req, res)),
      chalk.hex('#8c8c8c').bold(tokens.url(req, res)),
      chalk.hex('#2ed573').bold(tokens['response-time'](req, res) + ' ms'),
      chalk.hex('#f78fb3').bold('@ ' + tokens.date(req, res)),
      chalk.yellow(tokens['remote-addr'](req, res)),
      chalk.hex('#fffa65').bold('from ' + tokens.user(req, res)),
      chalk.hex('#1e90ff')(tokens['user-agent'](req, res)),
      ..._info,
      ''
    ].join(' ')
  },
  {
    // skip: function(req, res) {   return res.statusCode >= 200 && res.statusCode <= 399 },
  }
)

export default loggerMiddleware
