import 'dotenv/config';
import { query } from './lib/db.ts';

async function run() {
    await query(`
        UPDATE crm_documents 
        SET data = jsonb_set(
                       jsonb_set(data, '{status}', '"Pending"'),
                       '{pipelineStatus}', '"New Order"'
                   )
        WHERE collection_name = 'sales' AND data->>'status' = 'Declined'
    `);
    console.log("Updated via SQL JSONB function.");
    process.exit(0);
}
run().catch(console.error);
