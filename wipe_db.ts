import { query } from './lib/db.ts';

async function wipe() {
    console.log('Wiping crm_documents table...');
    await query('TRUNCATE crm_documents');
    console.log('Done wiping!');
    process.exit(0);
}

wipe().catch(console.error);
