-- Core Database Schema Definition for Production Hardening
-- This defines the tables for the Level 10 Admin Credential Engine and Lead Queuing.

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Agent',
    clearance_level INT DEFAULT 1,
    team VARCHAR(50) DEFAULT 'Alpha',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'New', -- 'New', 'Active', 'Closed Won', 'Closed Lost'
    urgency_score INT DEFAULT 50, -- Dynamic AI-calculated score
    assigned_agent_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_contacted_at TIMESTAMP WITH TIME ZONE
);

-- Automation Tracking Table (30-Day Recovery Queue)
CREATE TABLE IF NOT EXISTS drip_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    sequence_step INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Completed'
    next_action_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Real-time Audit Trail (Hardened Logging)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    target_resource VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_drip_next_action ON drip_campaigns(next_action_date) WHERE status != 'Completed';

-- Generic Document Store for migrating from Firestore
CREATE TABLE IF NOT EXISTS crm_documents (
    id VARCHAR(255),
    collection_name VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_name, id)
);
CREATE INDEX idx_crm_documents_collection ON crm_documents(collection_name);
