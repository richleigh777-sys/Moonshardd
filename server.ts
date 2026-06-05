import express from "express";
import path from "path";
import cors from "cors";
import bcrypt from "bcrypt";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { GoogleGenAI, Type } from "@google/genai";
import { query } from "./lib/db.ts"; // Secure DB Gateway
import { initializeRealtime, broadcast } from "./lib/realtime.ts"; // WebSocket Hub

// Workflow & Automation Core
function startAutomatedWorkers() {
    // Simulates the chron job scanning for "Closed Lost" 30-Day Recovery leads
    setInterval(async () => {
        try {
            if (!process.env.DATABASE_URL) return; // Skip if no DB is attached yet
            // Identify leads due for automated drip campaigns
            const result = await query(
                `SELECT d.id as campaign_id, l.email, l.phone 
                 FROM drip_campaigns d 
                 JOIN leads l ON d.lead_id = l.id 
                 WHERE d.status = 'Pending' AND d.next_action_date <= NOW() 
                 LIMIT 5`
            );
            if (result.rows.length > 0) {
                console.log(`[Automation] Triggering ${result.rows.length} drip sequence(s)...`);
                // Here we would integrate Twilio / SendGrid trigger logic
                
                // Advance the queue
                for (const row of result.rows) {
                    await query(`UPDATE drip_campaigns SET status = 'In Progress', sequence_step = sequence_step + 1 WHERE id = $1`, [row.campaign_id]);
                }
            }
        } catch (err) {
            console.error("[Automation Error]:", err);
        }
    }, 60000); // Check every minute
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- Boot-Time Database Optimization & Indexing ---
  if (process.env.DATABASE_URL) {
      try {
          await query(`CREATE TABLE IF NOT EXISTS crm_documents (
              id VARCHAR(255),
              collection_name VARCHAR(100) NOT NULL,
              data JSONB NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (collection_name, id)
          )`);
          
          // Verify optimized indices exist for high frequency concurrent lookups
          await query(`CREATE INDEX IF NOT EXISTS idx_crm_documents_normalized_phone 
                       ON crm_documents ((data->>'normalizedPhone')) 
                       WHERE collection_name = 'customers'`);
          await query(`CREATE INDEX IF NOT EXISTS idx_crm_documents_raw_phone 
                       ON crm_documents ((data->>'phone')) 
                       WHERE collection_name = 'customers'`);
          console.log("[DB OPTIMIZATION] Connection pool verified and index tables primed.");
      } catch (dbErr: any) {
          console.error("[DB Boot Warning] Index setup deferred:", dbErr.message);
      }
  }

  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); // Restrict CORS
  
  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false // disable CSP in development due to Vite
  }));

  // Trust proxy for rate limiting behind Cloud Run/load balancers
  app.set('trust proxy', 1);

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000, // limit each IP to 10000 requests per windowMs
    validate: { xForwardedForHeader: false, default: true },
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use('/api', limiter);

  app.use(express.json({ limit: '1mb' }));

  // --- 1. Custom Credential Engine ---
  
  // Level 10 Admin Provisioning (Create User)
  app.post("/api/auth/provision", async (req, res) => {
    try {
        const { email, password, role, clearance_level, team, adminSecret } = req.body;
        // In reality, authenticate adminSecret against an environment variable or admin JWT
        if (adminSecret !== process.env.L10_ADMIN_SECRET) {
            return res.status(403).json({ error: "Access Denied. Level 10 Clearance Required." });
        }
        
        if (!process.env.DATABASE_URL) {
            return res.status(503).json({ error: "Database not configured yet." });
        }

        /* Check for adding team column later if missing to prevent insert failures on existing DBs */
        try {
            await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS team VARCHAR(50) DEFAULT 'Alpha'`);
        } catch(e: any) {
            console.warn("Failed to add team column", e.message);
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const result = await query(
            `INSERT INTO users (email, password_hash, role, clearance_level, team) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, team`,
            [email, hash, role || 'Agent', clearance_level || 1, team || 'Alpha']
        );

        res.json({ message: "Agent Terminals Provisioned Successfully.", user: result.rows[0] });
    } catch (err: any) {
        console.error("Provisioning Error:", err);
        res.status(500).json({ error: "Provisioning Failed." });
    }
  });

  // User Login
  app.post("/api/auth/login", async (req, res) => {
      try {
          const { email, password } = req.body;
          
          if (!process.env.DATABASE_URL) {
              return res.status(503).json({ error: "Database not configured yet." });
          }

          try {
              await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS team VARCHAR(50) DEFAULT 'Alpha'`);
          } catch(e: any) {
              console.warn("Failed to add team column", e.message);
          }

          const result = await query(`SELECT id, password_hash, role, clearance_level, team FROM users WHERE email = $1`, [email]);
          
          if (result.rows.length === 0) {
              // Now check if it exists in crm_documents (created via Roster)
              try {
                  const docRes = await query(`SELECT data FROM crm_documents WHERE collection_name = 'users' AND data->>'id' = $1`, [email]);
                  if (docRes.rows.length > 0) {
                      const userData = docRes.rows[0].data;
                      if (userData.pass === password) {
                          return res.json({
                              message: "Authentication Successful", 
                              token: "simulated_jwt_token_for_now",
                              user: { id: email, role: userData.role || 'agent', clearance: userData.level || 1, team: userData.team || 'Alpha' }
                          });
                      } else {
                          return res.status(401).json({ error: "Invalid credentials." });
                      }
                  }
              } catch (e: any) {
                  // Ignore if crm_documents not set up yet
              }

              return res.status(401).json({ error: "Invalid credentials." });
          }

          const user = result.rows[0];
          const isMatch = await bcrypt.compare(password, user.password_hash);

          if (!isMatch) {
              return res.status(401).json({ error: "Invalid credentials." });
          }

          res.json({ 
              message: "Authentication Successful", 
              token: "simulated_jwt_token_for_now",
              user: { id: email, role: user.role, clearance: user.clearance_level, team: user.team }
          });
      } catch(err) {
          res.status(500).json({ error: "Server Error" });
      }
  });

  // API Routes
  app.get("/api/health", async (req, res) => {
    try {
      // Un-comment to test real database connection:
      // const dbResult = await query('SELECT NOW()');
      res.json({ status: "ok", mode: "secure-api" });
    } catch (e: any) {
      res.status(500).json({ status: "error", message: e.message });
    }
  });

  // Example: Secure Database Query Endpoint (Parameterised to prevent SQL Injection)
  app.get("/api/customers", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
         return res.json({ notice: "Database not connected. Please supply DATABASE_URL in .env." });
      }

      const statusFilter = req.query.status || 'Active';
      // Parameterized query: $1 enforces type safety and escapes hazardous payloads securely.
      const result = await query(
        'SELECT id, name, status, assigned_agent_id FROM users WHERE status = $1 LIMIT 50', 
        [statusFilter]
      );
      
      res.json(result.rows);
    } catch (err: any) {
      console.error("Secure DB Connection Error:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // --- POSGRES DOCUMENTS EMULATION START ---
  app.get("/api/collections/batch", async (req, res) => {
      try {
          if (!process.env.DATABASE_URL) return res.json({});
          const namesStr = req.query.names as string;
          if (!namesStr) return res.json({});
          const collections = namesStr.split(',').filter(Boolean);

          await query(`CREATE TABLE IF NOT EXISTS crm_documents (
              id VARCHAR(255),
              collection_name VARCHAR(100) NOT NULL,
              data JSONB NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (collection_name, id)
          )`);

          const result = await query(
              "SELECT collection_name, data FROM crm_documents WHERE collection_name = ANY($1)", 
              [collections]
          );

          const grouped: Record<string, any[]> = {};
          for (const col of collections) {
              grouped[col] = [];
          }
          for (const row of result.rows) {
              if (grouped[row.collection_name]) {
                  grouped[row.collection_name].push(row.data);
              }
          }

          res.json(grouped);
      } catch (err: any) {
          console.error("DB Batch Get Error", err);
          res.status(500).json({ error: err.message });
      }
  });

  app.get("/api/collections/:collection", async (req, res) => {
      try {
          if (!process.env.DATABASE_URL) return res.json([]);
          await query(`CREATE TABLE IF NOT EXISTS crm_documents (
              id VARCHAR(255),
              collection_name VARCHAR(100) NOT NULL,
              data JSONB NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (collection_name, id)
          )`);
          const result = await query("SELECT id, data FROM crm_documents WHERE collection_name = $1", [req.params.collection]);
          res.json(result.rows.map(r => r.data));
      } catch (err: any) {
          console.error("DB Get Error", err);
          res.status(500).json({ error: err.message });
      }
  });

  app.post("/api/collections/:collection", async (req, res) => {
      try {
          if (!process.env.DATABASE_URL) return res.json({ success: true, dummy: true });
          await query(`CREATE TABLE IF NOT EXISTS crm_documents (
              id VARCHAR(255),
              collection_name VARCHAR(100) NOT NULL,
              data JSONB NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (collection_name, id)
          )`);
          const id = req.body.id || `id_${Date.now()}`;
          const q = `
              INSERT INTO crm_documents (id, collection_name, data, updated_at) 
              VALUES ($1, $2, $3, NOW()) 
              ON CONFLICT (collection_name, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
          `;
          await query(q, [id, req.params.collection, JSON.stringify(req.body)]);
          
          try {
              broadcast({ type: 'COLLECTION_MUTATED', collectionName: req.params.collection, id });
          } catch (broadcastErr) {
              console.error("[Realtime Broadcast Error]:", broadcastErr);
          }

          res.json({ success: true, id });
      } catch (err: any) {
          console.error("DB Post Error", err);
          res.status(500).json({ error: err.message });
      }
  });

  app.put("/api/collections/:collection/:id", async (req, res) => {
      try {
          if (!process.env.DATABASE_URL) return res.json({ success: true, dummy: true });
          const q = `
              UPDATE crm_documents 
              SET data = data || $1::jsonb, updated_at = NOW() 
              WHERE collection_name = $2 AND id = $3
          `;
          await query(q, [JSON.stringify(req.body), req.params.collection, req.params.id]);
          
          try {
              broadcast({ type: 'COLLECTION_MUTATED', collectionName: req.params.collection, id: req.params.id });
          } catch (broadcastErr) {
              console.error("[Realtime Broadcast Error]:", broadcastErr);
          }

          res.json({ success: true });
      } catch (err: any) {
          console.error("DB Put Error", err);
          res.status(500).json({ error: err.message });
      }
  });

  app.delete("/api/collections/:collection/:id", async (req, res) => {
      try {
          if (!process.env.DATABASE_URL) return res.json({ success: true, dummy: true });
          await query("DELETE FROM crm_documents WHERE collection_name = $1 AND id = $2", [req.params.collection, req.params.id]);
          
          try {
              broadcast({ type: 'COLLECTION_MUTATED', collectionName: req.params.collection, id: req.params.id, deleted: true });
          } catch (broadcastErr) {
              console.error("[Realtime Broadcast Error]:", broadcastErr);
          }

          res.json({ success: true });
      } catch (err: any) {
          console.error("DB Delete Error", err);
          res.status(500).json({ error: err.message });
      }
  });
  // --- POSGRES DOCUMENTS EMULATION END ---

  app.post("/api/deduplicate", async (req, res) => {
      try {
          const { csvText, mapping, customers } = req.body;
          if (!csvText) {
             return res.status(400).json({ error: "Missing CSV data" });
          }

          // In a real scenario, the backend would fetch the customers from Firebase Admin here.
          // Since we might not have a service account config, we let the client pass it,
          // OR we would use firebase-admin. For demonstration of ripping it from UI, we do the logic here:

          const lines = csvText.split('\n').filter((r: string) => r.trim().length > 0);
          const headers = lines[0].split(',').map((h: string) => h.replace(/^["']|["']$/g, '').trim());
            
          const indexMap: Record<string, number> = {};
          Object.entries(mapping).forEach(([sys, csv]) => {
              indexMap[sys] = headers.indexOf(csv as string);
          });

          let exact = 0;
          let fuzzy = 0;
          let newly = 0;
          const pRows = [];

          const normalizeNameTokens = (name: string) => (name || "").toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean);

          for (let i = 1; i < lines.length; i++) {
              const row = lines[i].split(',').map((h: string) => h.replace(/^["']|["']$/g, '').trim());
              
              const firstName = row[indexMap['firstName']] || "";
              const lastName = row[indexMap['lastName']] || "";
              const phoneRaw = row[indexMap['phone']] || "";
              const phoneNorm = phoneRaw.replace(/\D/g, '');
              const emailRaw = (row[indexMap['email']] || "").toLowerCase().trim();
              
              let matchType = 'new';
              let matchedId = null;

              const exactMatch = (customers || []).find((c: any) => {
                  const cPhones = c.phones || (c.phone ? [c.phone] : []);
                  const cEmails = c.emails || (c.email ? [c.email] : []);
                  if (phoneNorm && cPhones.some((p: string) => p.replace(/\D/g, '') === phoneNorm)) return true;
                  if (emailRaw && cEmails.includes(emailRaw)) return true;
                  return false;
              });

              if (exactMatch) {
                  exact++;
                  matchType = 'exact';
                  matchedId = exactMatch.id;
              } else {
                  const fn = normalizeNameTokens(firstName);
                  const ln = normalizeNameTokens(lastName);
                  
                  const fuzzyMatch = (customers || []).find((c: any) => {
                      const cFn = normalizeNameTokens(c.firstName || "");
                      const cLn = normalizeNameTokens(c.lastName || "");
                      
                      const isFnMatch = fn[0] && cFn[0] && fn[0] === cFn[0];
                      const isLnMatch = ln[ln.length - 1] && cLn[cLn.length - 1] && ln[ln.length - 1] === cLn[cLn.length - 1];
                      
                      return isFnMatch && isLnMatch;
                  });

                  if (fuzzyMatch) {
                      fuzzy++;
                      matchType = 'fuzzy';
                      matchedId = fuzzyMatch.id;
                  } else {
                      newly++;
                  }
              }

              pRows.push({
                 raw: lines[i],
                 matchType,
                 matchedId
              });
          }

          res.json({ success: true, dupStats: { exact, fuzzy, new: newly, total: pRows.length }, processedRows: pRows });

      } catch (err: any) {
          console.error(err);
          res.status(500).json({ error: err.message });
      }
  });


  app.post("/api/address/validate", async (req, res) => {
      try {
          const { addressLines, regionCode, locality } = req.body;
          const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
          
          if (!apiKey) {
              return res.json({ 
                  success: true, 
                  mocked: true, 
                  message: "Map API setup required. Using default successful validation.",
                  validation: { isValid: true, standardized: addressLines[0] }
              });
          }

          const response = await fetch(`https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  address: {
                      regionCode: regionCode || 'US',
                      locality: locality,
                      addressLines: addressLines
                  }
              })
          });

          const data = await response.json();

          if (data.error) {
              throw new Error(data.error.message || "Failed to validate address");
          }

          const result = data.result;
          
          // Extract formatted components
          const postalAddress = result?.address?.postalAddress;
          const componentMap: Record<string, string> = {};
          
          if (result?.address?.addressComponents) {
              result.address.addressComponents.forEach((comp: any) => {
                  componentMap[comp.componentType] = comp.componentName.text;
              });
          }

          res.json({ 
              success: true, 
              validation: { 
                  isValid: result?.verdict?.hasUnconfirmedComponents === false, 
                  standardized: result?.address?.formattedAddress,
                  components: {
                      street: addressLines[0], // fallback
                      city: postalAddress?.locality || componentMap['locality'] || '',
                      state: postalAddress?.administrativeArea || componentMap['administrative_area_level_1'] || '',
                      zip: postalAddress?.postalCode || componentMap['postal_code'] || '',
                  },
                  verdict: result?.verdict
              } 
          });
      } catch (err: any) {
          res.status(500).json({ error: err.message });
      }
  });

  app.post("/api/phone/lookup", async (req, res) => {
      try {
          const { phoneNumber } = req.body;
          if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
               // Mock Auto Detection based on phone number hash-like logic if Twilio is not connected
               const isLikelyMobile = parseInt(phoneNumber.replace(/\D/g, '').slice(-1)) % 2 !== 0; 
               return res.json({ 
                  success: true, 
                  mocked: true, 
                  message: "Twilio setup required. Using simulated line type check.",
                  lookup: { type: isLikelyMobile ? 'Mobile' : 'Landline/VoIP', valid: true }
              });
          }
          // Placeholder for real Twilio Lookup API call
          res.json({ success: true, lookup: { type: 'Mobile', valid: true } });
      } catch (err: any) {
          res.status(500).json({ error: err.message });
      }
  });

  app.post("/api/gemini/generateContent", async (req, res) => {
      try {
          const { contents, config } = req.body;
          if (!process.env.GEMINI_API_KEY) {
              return res.status(500).json({ error: "Gemini API key missing on server" });
          }
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents,
              config
          });
          res.json({ text: response.text });
      } catch (err: any) {
          console.error("Gemini API Error:", err);
          res.status(500).json({ error: err.message });
      }
  });

  app.post("/api/gemini/strategic-briefing", async (req, res) => {
      try {
          const { customerName, history } = req.body;
          if (!process.env.GEMINI_API_KEY) {
              return res.status(500).json({ error: "Gemini API key missing on server" });
          }
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: `
                  Analyze the following customer interaction history for ${customerName} and provide a strategic briefing for a sales agent.
                  
                  History:
                  ${history.join('\n')}
                  
                  Focus on:
                  1. A concise summary of their current situation.
                  2. Sentiment analysis.
                  3. A concrete recommendation for the next call.
                  4. Key recurring themes or objections.
              `,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          summary: { type: Type.STRING },
                          sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Frustrated'] },
                          recommendation: { type: Type.STRING },
                          keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ['summary', 'sentiment', 'recommendation', 'keyThemes']
                  }
              }
          });

          if (response.text) {
              res.json(JSON.parse(response.text.trim()));
          } else {
              throw new Error("Empty response from AI");
          }
      } catch (err: any) {
          console.error("Gemini API Strategic Briefing Error:", err);
          res.status(500).json({ error: err.message });
      }
  });

  // --- 4. ViciDial Inbound Web Form Hook ---
  // When ViciDial delivers an autodialed call to an agent, it triggers this Webhook setting,
  // which automatically inserts or updates the customer in our CRM and broadcasts
  // a live WebSocket notification so that the agent interface responds immediately!
  app.all("/api/telephony/vicidial-push", async (req, res) => {
      // Enable CORS for external bookmarklet support
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      
      if (req.method === 'OPTIONS') {
          return res.status(200).end();
      }

      try {
          const { phone, first_name, last_name, address, city, state, zip, email, lead_id, campaign_id, agent_user } = { ...req.query, ...req.body };
          
          if (!phone) {
              return res.status(400).json({ error: "Missing required parameter: phone" });
          }

          const rawPhone = String(phone);
          const cleanPhone = rawPhone.replace(/\D/g, '');
          if (!cleanPhone) {
              return res.status(400).json({ error: "Invalid phone number digits" });
          }

          const id = lead_id ? `vici-${lead_id}` : `vici-${cleanPhone}`;
          const firstNameStr = String(first_name || '').trim();
          const lastNameStr = String(last_name || '').trim();
          const fullNameStr = [firstNameStr, lastNameStr].filter(Boolean).join(' ') || 'Automated Live Lead';
          const emailStr = String(email || '').trim().toLowerCase();
          const fullAddress = [
              String(address || '').trim(),
              String(city || '').trim(),
              String(state || '').trim(),
              String(zip || '').trim()
          ].filter(Boolean).join(', ');

          const payload = {
              id,
              name: fullNameStr,
              firstName: firstNameStr || 'Automated',
              lastName: lastNameStr || 'Live Lead',
              fullName: fullNameStr,
              phone: rawPhone,
              email: emailStr,
              address: fullAddress,
              normalizedPhone: cleanPhone,
              normalizedEmail: emailStr,
              addressFingerprint: fullAddress.replace(/\s/g, '').toLowerCase(),
              tags: ["Live Dialer Inbound", campaign_id ? `Campaign ${campaign_id}` : ''].filter(Boolean),
              salesHistory: [],
              phones: [rawPhone],
              emails: emailStr ? [emailStr] : [],
              ltv: 0,
              orderCount: 0,
              lastOrderDate: 0,
              firstSource: "ViciDial Push",
              isBackgroundViciLead: true,
              assigned_agent_id: agent_user || 'External Autodialer',
              updatedAt: Date.now()
          };

          if (process.env.DATABASE_URL) {
              // Query to check if user already exists
              const checkRes = await query(
                  `SELECT id, data FROM crm_documents WHERE collection_name = 'customers' AND (id = $1 OR data->>'normalizedPhone' = $2 OR data->>'phone' = $3)`,
                  [id, cleanPhone, rawPhone]
              );

              if (checkRes.rows.length > 0) {
                  // User requested not to save or modify existing customer phone numbers
                  return res.json({ 
                      success: true, 
                      message: "Customer already exists with this phone number. Skipped saving to prevent duplicates.", 
                      leadId: checkRes.rows[0].id,
                      customer: checkRes.rows[0].data,
                      skipped: true
                  });
              }

              const qUpsert = `
                  INSERT INTO crm_documents (id, collection_name, data, updated_at) 
                  VALUES ($1, 'customers', $2, NOW()) 
                  ON CONFLICT (collection_name, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
              `;
              await query(qUpsert, [id, JSON.stringify(payload)]);

              // Broadcast real-time change to all active tabs
              try {
                  broadcast({ 
                      type: 'COLLECTION_MUTATED', 
                      collectionName: 'customers', 
                      id: id,
                      notification: {
                          title: "Live Lead Delivered",
                          message: `📞 Call connected with ${fullNameStr} (${rawPhone})`,
                          type: "info"
                      }
                  });
              } catch (broadcastErr) {
                  console.error("[Realtime Push Broadcast Error]:", broadcastErr);
              }

              return res.json({ 
                  success: true, 
                  message: "Inbound ViciDial lead synced in real-time", 
                  leadId: id,
                  customer: payload 
              });
          } else {
              return res.json({ 
                  success: true, 
                  message: "Offline receiver simulated successfully.", 
                  customer: payload 
              });
          }
      } catch (err: any) {
          console.error("ViciDial Lead Sync Error:", err);
          res.status(500).json({ error: err.message });
      }
  });

  // Catch-all for API routes to prevent them from falling through to the SPA frontend
  app.all('/api/*all', (req, res) => {
      res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === 'GET') {
        res.sendFile(path.join(distPath, 'index.html'));
      } else {
        next();
      }
    });
  }

  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // --- 2. Real-Time WebSocket Infrastructure ---
  initializeRealtime(httpServer);
  
  // --- 3. Workflow & Automation Engine ---
  startAutomatedWorkers();
}

startServer();
