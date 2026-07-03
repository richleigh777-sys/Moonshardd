const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const res = await pool.query("SELECT COUNT(*) FROM crm_documents WHERE collection_name = 'sales'");
  console.log("Sales count:", res.rows[0].count);
  const sample = await pool.query("SELECT data FROM crm_documents WHERE collection_name = 'sales' LIMIT 5");
  console.log("Sample:", JSON.stringify(sample.rows.map(r => r.data), null, 2));
  process.exit(0);
})();
