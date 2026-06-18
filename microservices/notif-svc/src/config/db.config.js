import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Database connection successful");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    process.exit(1); // le service ne doit pas tourner sans sa DB
  }
}

export default connectDB;

