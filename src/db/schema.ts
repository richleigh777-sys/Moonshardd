import { pgTable, varchar, jsonb, timestamp, primaryKey, customType, index , boolean, integer} from 'drizzle-orm/pg-core';
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
  search_text: varchar('search_text').generatedAlwaysAs((): any => sql`coalesce(data->>'customer', '') || ' ' || coalesce(data->>'email', '') || ' ' || coalesce(data->>'orderId', '') || ' ' || coalesce(data->>'phone', '') || ' ' || coalesce(data->>'customerName', '') || ' ' || coalesce(data->>'agent', '')`),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.collection_name, table.id] }),
    searchIdx: index('search_idx').using('gin', table.search_vector),
    trgmIdx: index('trgm_idx').using('gin', sql`${table.search_text} gin_trgm_ops`)
  }
});

export const crmSavedFilters = pgTable('crm_saved_filters', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  filters: jsonb('filters').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const crmDispositionReasons = pgTable('crm_disposition_reasons', {
  id: varchar('id', { length: 255 }).primaryKey(),
  reason: varchar('reason', { length: 255 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const crmAgentWorkStates = pgTable('crm_agent_work_states', {
  user_id: varchar('user_id', { length: 255 }).primaryKey(),
  is_on_break: boolean('is_on_break').default(false).notNull(),
  break_start_time: timestamp('break_start_time', { withTimezone: true }),
  total_break_time: integer('total_break_time').default(0).notNull(),
  break_reason: varchar('break_reason', { length: 255 }),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const crmAgentScratchpads = pgTable('crm_agent_scratchpads', {
  user_id: varchar('user_id', { length: 255 }).primaryKey(),
  data: jsonb('data').notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const crmTelephonySettings = pgTable('crm_telephony_settings', {
  user_id: varchar('user_id', { length: 255 }).primaryKey(),
  vici_user: varchar('vici_user', { length: 255 }),
  vici_pass: varchar('vici_pass', { length: 255 }),
  vici_phone: varchar('vici_phone', { length: 255 }),
  vici_dialer_url: varchar('vici_dialer_url', { length: 255 }),
  vici_campaign_id: varchar('vici_campaign_id', { length: 255 }),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
