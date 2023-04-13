import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express, { ErrorRequestHandler, Request, Response, Next } from 'express'
import cors from 'cors'
import asyncHandler from 'express-async-handler'
import compression from 'compression'

import { AuthRequest } from './types/AuthRequest'
import { APP_ORIGIN, CORS_ORIGIN_REGEX, ENVIRONMENT, EXPRESS_TRUST_PROXY_OPTS, UPLOAD_METHOD } from './util/secrets'
import { getAuthConnection, processJWT, usingOpenId } from './services/auth'
import { wrapController } from './routers/wrapController'
import apiRouter from './api/api.router'

// Begin Controllers
import * as authControllerRaw from './controllers/auth'
const authController = wrapController(authControllerRaw)

// End Controllers

import { init } from './init'
import { getBuild } from './util/handler'
import { getCustomLogProps, httpLogger } from './util/logger'
import { usersRouter } from './routers/users/users.router'

const app = express()

if (!process.env.NO_INIT) {
  init()
}

app.set('port', process.env.PORT || 4000)
app.set('trust proxy', EXPRESS_TRUST_PROXY_OPTS)

// Pretty print on dev
if (ENVIRONMENT !== 'production') {
  app.set('json spaces', 2)
}

app.use(cookieParser())

// Health check route (does not require JWT or cors)
app.get('/healthcheck', (req, res) => {
  // TODO: more robust health check?
  res.status(200).json({
    status: 200,
    healthy: true
  })
})

app.get('/favicon.ico', (req, res) => {
  res.status(404).send('')
})

app.use(compression())

app.get('/', (req, res) => {
  res.json({
    name: 'Rednder API',
    production: ENVIRONMENT === 'production',
    api_host: req.protocol + '://' + req.hostname + ':' + app.get('port'),
    app_origin: APP_ORIGIN,
    config_source: 'db',
    email_enabled: false,
    build: getBuild()
  })
})

app.use(httpLogger)

// Initialize db connections
app.use(async (req, res, next) => {
  try {
    await init()
    next()
  } catch (e) {
    next(e)
  }
})

// increase max payload json size to 1mb
app.use(bodyParser.json({ limit: '1mb' }))

// Public API routes (does not require JWT, does require cors with origin = *)

// For preflight requests
app.options(
  '/api/features/:key?',
  cors({
    credentials: false,
    origin: '*'
  }),
  function (req, res) {
    res.send(200)
  }
)

// Secret API routes (no JWT or CORS)
app.use(
  '/api/v1',
  // TODO add authentication
  cors({
    origin: '*'
  }),
  apiRouter
)

// Accept cross-origin requests from the frontend app
const origins: (string | RegExp)[] = [APP_ORIGIN]
if (CORS_ORIGIN_REGEX) {
  origins.push(CORS_ORIGIN_REGEX)
}
app.use(
  cors({
    credentials: true,
    origin: origins
  })
)

const useSSO = usingOpenId()

// Pre-auth requests when not using SSO
if (!useSSO) {
  app.post('/api/auth/login', authController.postLogin)
  app.post('/api/auth/register', authController.postRegister)
  app.post('/api/auth/firsttime', authController.postFirstTimeRegister)
  app.post('/api/auth/forgot', authController.postForgotPassword)
  app.get('/api/auth/reset/:token', authController.getResetPassword)
  app.post('/api/auth/reset/:token', authController.postResetPassword)
}
// Pre-auth requests when using SSO
else {
  app.post('/api/auth/sso', authController.getSSOConnectionFromDomain)
  app.post('/api/auth/callback', authController.postOAuthCallback)
}

//  Pre-auth requests that are always available
app.post('/api/auth/refresh', authController.postRefresh)
app.post('/api/auth/logout', authController.postLogout)

// All other routes require a valid JWT
const auth = getAuthConnection()
app.use('/api', auth.middleware)

// Add logged in user props to the request
app.use(processJWT)

// Add logged in user props to the logger
app.use((req: AuthRequest, res: Response & { log: AuthRequest['log'] }, next) => {
  res.log = req.log = req.log.child(getCustomLogProps(req as Request))
  next()
})

// Logged-in auth requests
if (!useSSO) {
  app.post('/auth/change-password', authController.postChangePassword)
}

app.use('/user', usersRouter)

// Every other route requires a userId to be set
app.use(
  asyncHandler(async (req: AuthRequest, res, next: Next) => {
    if (!req.userId) {
      throw new Error('Must be authenticated.  Try refreshing the page.')
    }
    next()
  })
)

// Fallback 404 route if nothing else matches
app.use(function (req, res) {
  res.status(404).json({
    status: 404,
    message: 'Route not found'
  })
})

const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res: Response & { sentry?: string },
  // eslint-disable-next-line
  next
) => {
  const status = err.status || 400

  if (req.log) {
    req.log.error(err.message)
  } else {
    httpLogger.logger.error(getCustomLogProps(req), err.message)
  }

  res.status(status).json({
    status: status,
    message: err.message || 'An error occurred',
    errorId: undefined
  })
}
app.use(errorHandler)

export default app
