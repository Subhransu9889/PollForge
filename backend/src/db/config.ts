import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI ?? process.env.MONOGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured. Set MONGODB_URI in the backend environment variables.");
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
