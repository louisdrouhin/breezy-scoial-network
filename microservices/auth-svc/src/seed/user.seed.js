import 'dotenv/config.js';
import sequelize from '../config/database.config.js';
import { Account } from '../models/index.js';
import { hashPassword } from '../utils/bcrypt.util.js';

if (process.env.NODE_ENV === 'production') {
  console.log('NODE_ENV=production detected — seed is disabled by default.');
  process.exit(0);
}

if (process.env.SEED_ENABLED !== 'true') {
  console.log('SEED_ENABLED is not set to true — seed is disabled.');
  process.exit(0);
}

async function runSeed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    await sequelize.sync();
    console.log('Models synchronized');

    const users = [
      { username: 'admin', email: 'admin@example.com', password: 'Password123!', role: 'ADMIN' },
      { username: 'user', email: 'user@example.com', password: 'Password123!', role: 'USER' },
    ];

    for (const u of users) {
      const existing = await Account.findByPk(u.username);

      if (existing) {
        console.log(`User ${u.username} already exists — skipping`);
        continue;
      }

      const passwordHash = await hashPassword(u.password);

      await Account.create({
        username: u.username,
        email: u.email,
        passwordHash,
        role: u.role,
      });

      console.log(`User created: ${u.username}`);
    }

    console.log('Seed completed');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runSeed();
