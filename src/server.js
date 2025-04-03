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

  const httpServer = createServer(app)
  const io = new Server(httpServer, {
    cors: corsOptions
  })

  app.use((req, res, next) => {
    req.io = io
    next()
  })

  app.use('/v1', APIs_V1)

  // Middleware error handling
  app.use(errorHandlingMiddleware)

  let typingReviewUsers = {}
  io.on('connection', (socket) => {
    console.log('User connected: ', socket.id)

    socket.on('FE_JOIN_PRODUCT', (productId) => {
      // console.log('FE_JOIN_PRODUCT', socket.id)
      socket.join(productId)
      socket.emit('BE_UPDATE_TYPING', { productId, users: [...(typingReviewUsers[productId] || [])] })
    })

    socket.on('FE_LEAVE_PRODUCT', (productId) => {
      // console.log('FE_LEAVE_PRODUCT', socket.id)
      socket.leave(productId)
    })

    socket.on('FE_START_TYPING', ({ productId, userId }) => {
      // console.log('FE_START_TYPING', socket.id)
      if (!typingReviewUsers[productId]) typingReviewUsers[productId] = new Set()
      typingReviewUsers[productId].add(userId)

      socket.to(productId).emit('BE_UPDATE_TYPING', { productId, users: [...typingReviewUsers[productId]] })
    })

    socket.on('FE_STOP_TYPING', ({ productId, userId }) => {
      // console.log('FE_STOP_TYPING', socket.id)
      if (typingReviewUsers[productId]) {
        typingReviewUsers[productId].delete(userId)
        if (typingReviewUsers[productId].size === 0) delete typingReviewUsers[productId]
      }

      socket.to(productId).emit('BE_UPDATE_TYPING', { productId, users: [...(typingReviewUsers[productId] || [])] })
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
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
