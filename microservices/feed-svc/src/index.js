import "dotenv/config";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Feed service listening on port ${PORT}`);
});
