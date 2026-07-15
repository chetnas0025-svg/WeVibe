const { Client } = require('pg');

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
  console.log("Connecting to Postgres database to confirm email...");
  await client.connect();
  
  const query = `
    UPDATE auth.users 
    SET email_confirmed_at = now(), last_sign_in_at = now()
    WHERE email = 'pinkblueadmin@gmail.com'
  `;
  
  const res = await client.query(query);
  console.log(`Email confirmation updated. Rows affected: ${res.rowCount}`);
  
  await client.end();
}

run().catch(err => {
  console.error("Error confirming email:", err);
  client.end();
  process.exit(1);
});
