import "dotenv/config"
import express from "express"

const app = express()
const PORT = process.env.PORT || 3004

app.use(express.json())

// Route de santé
app.get("/api/health", (req, res) => {
  res.json({ status: "UP" })
})

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Notification service listening on port ${PORT}`)
})
