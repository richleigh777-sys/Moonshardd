const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    host: process.env.SQL_HOST, 
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(err);
  else console.log(res.rows[0]);
  pool.end();
});
