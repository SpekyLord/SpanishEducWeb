import mongoose from 'mongoose'

let cachedConnection = null

async function connectDB() {
  if (cachedConnection && cachedConnection.readyState === 1) {
    return cachedConnection
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    cachedConnection = connection.connection
    console.log('MongoDB connected successfully')
    return cachedConnection
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export default connectDB
