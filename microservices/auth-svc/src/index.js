import 'dotenv/config.js';
import express from 'express';

const app = express();
const port = process.env.API_PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-svc' });
});

const server = app.listen(port, () => {
  console.log(`auth-svc running on port ${port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
