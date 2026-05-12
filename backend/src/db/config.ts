import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI ?? process.env.MONOGODB_URI;

  if (!uri) {
    console.warn("MONGODB_URI is not set. Backend will start, but database calls will fail.");
    return;
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
