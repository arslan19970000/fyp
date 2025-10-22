import mongoose from "mongoose"

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI as string
  const MONGODB_DB = process.env.MONGODB_DB || "nextuth"

  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable")
  }

  if (global._mongooseConn) return global._mongooseConn
  global._mongooseConn = mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB }).then((m) => m)
  return global._mongooseConn
}
