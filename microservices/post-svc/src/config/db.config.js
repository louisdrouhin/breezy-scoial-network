import mongoose from "mongoose";

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    await mongoose.connect(uri);
    console.log("MongoDB connection successful (post-svc)");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  }
}

export default connectDB;
