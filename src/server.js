/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from './config/cors'
import cookieParser from 'cookie-parser'
import swaggerDocs from '~/docs/swagger'
import { createServer } from 'http'
import { Server } from 'socket.io'

const START_SERVER = () => {
  const app = express()

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())

  app.use(express.json())

  app.use(cors(corsOptions))

  app.use('/v1', APIs_V1)

  // Middleware error handling
  app.use(errorHandlingMiddleware)

  const httpServer = createServer(app)

  const io = new Server(httpServer, {
    cors: corsOptions
  })

  io.on('connection', (socket) => {
    socket.on('FE_START_REVIEW', (data) => {
      socket.broadcast.emit('BE_START_REVIEW', data)
    })
    socket.on('FE_STOP_REVIEW', (data) => {
      socket.broadcast.emit('BE_STOP_REVIEW', data)
    })
  })


  if (env.BUILD_MODE === 'production') {
    httpServer.listen(process.env.PORT, process.env.HOST, () => {
      console.log(`Hello Levion, I am running on Render at port:${ process.env.PORT }`)
    })
  } else {
    httpServer.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`Hello Levion, I am running at ${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }`)
    })
    swaggerDocs(app)
  }
  exitHook(() => CLOSE_DB())
}

// Immediately-invoked / Anomymous Async Functions (IIFE)
(async () => {
  try {
    await CONNECT_DB()
    console.log('Connected to MongoDB Cloud Atlas')
    START_SERVER()
  } catch (error) {
    console.log(error)
    process.exit(0)
  }
})()
