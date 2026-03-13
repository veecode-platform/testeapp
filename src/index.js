const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '25060'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
    console.log(`Migration complete: ${file}`);
  }
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Hello from testeapp' });
});

app.get('/db/tables', async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    res.json({ tables: result.rows.map(r => r.table_name) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/db/status', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time, current_database() as database, current_user as user');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/db/items', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id');
    res.json({ items: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`testeapp listening on port ${port}`);
  runMigrations().catch(err => {
    console.error('Migration failed:', err.message);
  });
});
