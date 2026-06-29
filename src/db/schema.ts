import { pgTable, varchar, jsonb, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const crmDocuments = pgTable('crm_documents', {
  id: varchar('id', { length: 255 }).notNull(),
  collection_name: varchar('collection_name', { length: 100 }).notNull(),
  data: jsonb('data').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.collection_name, table.id] })
  }
});
