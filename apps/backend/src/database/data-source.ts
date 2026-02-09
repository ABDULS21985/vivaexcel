import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USER || 'digiweb',
  password: process.env.DB_PASSWORD || 'digiweb123',
  database: process.env.DB_NAME || 'digiweb',

  // Connection pooling
  poolSize: 20,
  extra: {
    min: 5,
    max: 20,
    // Query timeout 30 seconds
    statement_timeout: 30000,
    query_timeout: 30000,
  },

  // Entity and migration paths
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],

  // Synchronize should be false in production
  synchronize: false,

  // Logging configuration
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],

  // SSL configuration for production
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
