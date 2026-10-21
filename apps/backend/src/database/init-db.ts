import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
const { Client } = pg;

export async function initDb() {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5433),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'eventos',
  });

  try {
    await client.connect();
    console.log(`🔌 Conectado a PostgreSQL (${client.database}) en ${client.host}:${client.port}`);

    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Ejecutando script DDL de creación de tablas...');
    await client.query(sql);

    console.log('Base de datos inicializada con éxito.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  initDb();
}
