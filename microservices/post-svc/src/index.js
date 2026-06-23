import "dotenv/config";
import express from "express";
import connectDB from "./config/db.config.js";
import mongoose from "mongoose";
import postsRouter from "./routes/posts.routes.js";
import errorHandler from "./middlewares/error.js";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Public health check endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "UP", service: "post-svc" });
});

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "post-svc" });
});

// Register routes
app.use("/api/posts", postsRouter);

// Error handler (must be last)
app.use(errorHandler);

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`Post service listening on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("SIGTERM/SIGINT received, shutting down gracefully...");
      server.close(async () => {
        // Mongoose close
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (error) {
    console.error("Failed to start post service:", error);
    process.exit(1);
  }
}

startServer();
