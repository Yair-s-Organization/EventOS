import pg from 'pg';
const { Client } = pg;

async function verify() {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5433),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'eventos',
  });

  await client.connect();
  console.log('Conectado a la base de datos:', client.database);

  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log(`\nTotal de tablas encontradas: ${tablesRes.rows.length}\n`);

  for (const row of tablesRes.rows) {
    const tableName = row.table_name;
    const colsRes = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);

    const fksRes = await client.query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1;
    `, [tableName]);

    console.log(`Tabla: "${tableName}"`);
    for (const c of colsRes.rows) {
      const len = c.character_maximum_length ? `(${c.character_maximum_length})` : '';
      console.log(`   - ${c.column_name}: ${c.data_type}${len} [null: ${c.is_nullable}]`);
    }
    if (fksRes.rows.length > 0) {
      console.log(`   Foreign Keys:`);
      for (const fk of fksRes.rows) {
        console.log(`      * ${fk.column_name} -> ${fk.foreign_table_name}(${fk.foreign_column_name})`);
      }
    }
    console.log('');
  }

  await client.end();
}

verify().catch((err) => {
  console.error('Error al verificar:', err);
  process.exit(1);
});
