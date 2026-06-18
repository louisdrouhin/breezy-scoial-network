import 'dotenv/config.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import sequelize from './config/database.config.js';
import { Account, RefreshToken } from './models/index.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-svc' });
});

app.use('/api/auth', authRoutes);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    await sequelize.sync();
    console.log('Database synchronized');

    const server = app.listen(port, () => {
      console.log(`auth-svc running on port ${port}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await sequelize.close();
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  }
}

startServer();
