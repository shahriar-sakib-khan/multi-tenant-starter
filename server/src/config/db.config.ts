import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB database.
 *
 * @throws {Error} If the MONGO_URI is not set or the connection fails.
 * @returns {Promise<typeof mongoose>} The mongoose instance after connection.
 */
const connectDB = async (): Promise<typeof mongoose> => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error('❌ MONGO_URI not found in environment variables.');
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      dbName: process.env.DB_NAME,
    });

    console.log(`🟢 MongoDB connected at ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const err = error as Error;
    console.error(`🔴 MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
