const fs = require('fs');
const path = require('fs');
const { Client } = require('pg');

const directUrl = "postgresql://postgres.giypbmdsuspypbgudgap:8abduh772641299@aws-0-us-east-1.pooler.supabase.com:5432/postgres";

async function runMigration() {
  console.log('🚀 SRE Database Tool: Initiating direct PostgreSQL migration...');
  
  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to Supabase PostgreSQL!');

    // Read the migration SQL file
    const migrationPath = require('path').resolve(__dirname, '../prisma/migrations/20260727204500_init_cortex_db/migration.sql');
    console.log(`Reading migration SQL from: ${migrationPath}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration transaction...');
    await client.query('BEGIN;');
    await client.query(sql);
    await client.query('COMMIT;');
    console.log('🎉 Migration applied successfully inside Supabase PostgreSQL!');

    // Verify tables creation
    console.log('\nChecking created tables...');
    const { rows } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log(`Created Tables count: ${rows.length}`);
    rows.forEach(r => console.log(`  - ${r.table_name}`));

  } catch (err) {
    console.error('🛑 Migration failed. Rolling back...', err.message);
    try {
      await client.query('ROLLBACK;');
    } catch (e) {
      console.error('Rollback error:', e.message);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
