import 'dotenv/config'
import express from 'express'
import connectDB from './config/db.config.js'
import postsRouter from './routes/posts.routes.js'
import errorHandler from './middlewares/error.js'

const app = express()
const PORT = process.env.PORT || 3003

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' })
})

app.use('/api/posts', postsRouter)

app.use(errorHandler)

async function startServer() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Post service listening on port ${PORT}`)
  })
}

startServer()
