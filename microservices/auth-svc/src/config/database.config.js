import { Sequelize } from 'sequelize';

const getDatabaseUrl = () => {
  return (
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/auth_svc'
  );
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
