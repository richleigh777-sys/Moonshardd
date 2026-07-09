import 'dotenv/config';
import { query } from './lib/db.ts';

async function run() {
    const res = await query('SELECT * FROM crm_documents WHERE collection_name = $1', ['sales']);
    console.log("Sales count:", res.rowCount);
    process.exit(0);
}
run().catch(console.error);
