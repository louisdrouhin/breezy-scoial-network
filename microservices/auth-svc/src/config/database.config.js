import { Sequelize } from 'sequelize';

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return 'postgresql://postgres:postgres@localhost:5432/auth_svc';
  }
  // Remove Prisma-specific parameters (e.g., ?schema=public)
  return url.split('?')[0];
};

const sequelize = new Sequelize(getDatabaseUrl(), {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
