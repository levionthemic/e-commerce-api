import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'
import { sessionModel } from '~/models/sessionModel'
import { otpModel } from '~/models/otpModel'

let dbInstance = null

const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()

  dbInstance = mongoClientInstance.db(env.DATABASE_NAME)

  await dbInstance.collection(sessionModel.SESSION_COLLECTION_NAME).createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  )

  await dbInstance.collection(otpModel.OTP_COLLECTION_NAME).createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  )
}

export const GET_DB = () => {
  if (!dbInstance) {
    throw new Error('Must connect to Database first!')
  }
  return dbInstance
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}
