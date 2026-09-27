import mongoose from "mongoose";

const connectionState = globalThis.__zaheerMongoConnection ?? {
  promise: null,
  connected: false,
};

if (process.env.NODE_ENV !== "production") {
  globalThis.__zaheerMongoConnection = connectionState;
}

export async function connectDb() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) {
    const error = new Error("MongoDB is not configured.");
    error.code = "DATABASE_NOT_CONFIGURED";
    throw error;
  }

  if (!connectionState.promise) {
    connectionState.promise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      bufferCommands: false,
    }).then((connection) => {
      connectionState.connected = true;
      return connection;
    }).catch((error) => {
      connectionState.promise = null;
      throw error;
    });
  }

  await connectionState.promise;
  return mongoose.connection;
}
