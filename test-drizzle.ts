import { pgTable, varchar, jsonb, timestamp, primaryKey, customType, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

export const crmDocuments = pgTable('crm_documents', {
  id: varchar('id', { length: 255 }).notNull(),
  collection_name: varchar('collection_name', { length: 100 }).notNull(),
  data: jsonb('data').notNull(),
  search_vector: tsvector('search_vector').generatedAlwaysAs((): any => sql`to_tsvector('english', coalesce(data->>'customer', '') || ' ' || coalesce(data->>'email', '') || ' ' || coalesce(data->>'orderId', '') || ' ' || coalesce(data->>'phone', '') || ' ' || coalesce(data->>'customerName', '') || ' ' || coalesce(data->>'agent', ''))`),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.collection_name, table.id] }),
    searchIdx: index('search_idx').using('gin', table.search_vector)
  }
});
