import 'dotenv/config';
import { query } from './lib/db.ts';

async function run() {
    const res = await query("SELECT data->>'agentId' as agent, COUNT(*) FROM crm_documents WHERE collection_name = 'sales' GROUP BY data->>'agentId'");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}
run().catch(console.error);
