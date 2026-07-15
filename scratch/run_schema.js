const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const sqlPath = path.join(__dirname, '..', 'schema.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const client = new Client({
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.xbzjjtqyxokefzjvvqyd',
  password: 'qo8zkwXCeyjIoxvX',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  console.log("Connecting to Supabase Connection Pooler aws-0-ap-northeast-1.pooler.supabase.com...");
  await client.connect();
  console.log("Connected successfully. Running schema.sql queries...");
  
  await client.query(sql);
  
  console.log("schema.sql executed successfully!");
  await client.end();
}

run().catch(err => {
  console.error("Error executing schema.sql:", err);
  client.end();
  process.exit(1);
});
