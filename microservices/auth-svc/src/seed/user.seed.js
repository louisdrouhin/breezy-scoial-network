import 'dotenv/config.js';
import prisma from '../config/database.config.js';
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
    // TODO: Test database connection using Prisma
    // Hint: Use prisma.$queryRaw() or a simple findFirst() to test connection
    await prisma.account.findFirst();
    console.log('Database connection successful');

    // TODO: Sync/create tables if needed
    // Hint: With Prisma, use `npx prisma migrate deploy` or `npx prisma db push`
    // For seed, we assume migrations are already applied
    console.log('Models synchronized');

    const users = [
      { username: 'admin', email: 'admin@example.com', password: 'Password123!', role: 'ADMIN' },
      { username: 'user', email: 'user@example.com', password: 'Password123!', role: 'USER' },
    ];

    for (const u of users) {
      // TODO: Check if user already exists in the database
      // Hint: Use prisma.account.findUnique({ where: { username: u.username } })
      const existing = await prisma.account.findUnique({
        where: { username: u.username },
      });

      if (existing) {
        console.log(`User ${u.username} already exists — skipping`);
        continue;
      }

      const passwordHash = await hashPassword(u.password);

      // TODO: Create the new user in the database
      // Hint: Use prisma.account.create({ data: { ... } })
      await prisma.account.create({
        data: {
          username: u.username,
          email: u.email,
          passwordHash,
          role: u.role,
        },
      });

      console.log(`User created: ${u.username}`);
    }

    console.log('Seed completed');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSeed();
