const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(err);
  else console.log(res.rows[0]);
  pool.end();
});
