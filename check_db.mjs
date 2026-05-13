import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_ASbrFfje3x9v@ep-bitter-unit-ant9zxn1-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require' });
await client.connect();
const res = await client.query('SELECT * FROM users LIMIT 1');
console.log('User from DB:', res.rows[0]);
process.exit(0);
