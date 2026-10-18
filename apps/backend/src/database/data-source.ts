import 'reflect-metadata';                      // activa la lectura de metadata de decoradores
import { DataSource, DataSourceOptions } from 'typeorm';

export const dbOptions: DataSourceOptions = {   // los datos de conexión, reutilizables
  type: 'postgres',                             // qué base de datos
  host: process.env.DB_HOST ?? 'localhost',     // lee .env; si no existe, usa 'localhost'
  port: Number(process.env.DB_PORT ?? 5432),    // las variables llegan como texto; Number() lo convierte
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD,            // sin valor por defecto a propósito
  database: process.env.DB_NAME ?? 'eventos',
};

export default new DataSource({                 // este objeto solo lo usa el CLI de migraciones
  ...dbOptions,                                 // copia los datos de conexión de arriba
  entities: ['src/**/*.entity.ts'],             // dónde buscar las entidades (tablas)
  migrations: ['src/database/migrations/*.ts'], // dónde están/se guardan las migraciones
});