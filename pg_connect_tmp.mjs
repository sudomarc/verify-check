import { Client } from 'pg';
const client = new Client({
  host: 'db.hdfefhltqyxiqnuruhlp.supabase.co',
  port: 5432,
  user: 'postgres',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 8000
});
try {
  await client.connect();
  console.log('CONNECTE_OK');
  const r = await client.query('SELECT version();');
  console.log('VERSION=' + r.rows[0].version);
  await client.end();
} catch (e) {
  console.log('CONNECTE_ECHEC=' + String(e.message).slice(0, 500));
}
