import express from "express";
import dotenv from "dotenv";

import connectDB from "./config/db.config.js";

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startServer();
