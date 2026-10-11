import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dbOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'eventoos',
};

// Usado solo por el CLI de TypeORM (migraciones)
export default new DataSource({
  ...dbOptions,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});