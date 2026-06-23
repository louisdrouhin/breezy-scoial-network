import 'dotenv/config'
import express from 'express'
import feedRouter from './routes/feed.routes.js'
import errorHandler from './middlewares/error.js'

const app = express()
const PORT = process.env.PORT || 3005

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' })
})

app.use('/api/feed', feedRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Feed service listening on port ${PORT}`)
})
