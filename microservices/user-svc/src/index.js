import "dotenv/config";
import express from "express";
import sequelize from "./config/db.config.js";

import usersRoutes from "./routes/users.routes.js";
import internalRoutes from "./routes/internal.routes.js";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "user-svc" });
});

app.use("/api/users", usersRoutes);
app.use("/internal/users", internalRoutes);

// Error handler (must be last)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

async function main() {
  try {
    // Sync database
    await sequelize.sync({ alter: true });
    console.log("Database synced");

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`User service listening on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down gracefully...");
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await sequelize.close();
    process.exit(1);
  }
}

main();
