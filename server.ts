import express from "express";
import path from "path";
import cors from "cors";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";
import { query } from "./lib/db.ts"; // Secure DB Gateway
import { initializeRealtime } from "./lib/realtime.ts"; // WebSocket Hub

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

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

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

              // Special bypass for simulation accounts from Login screen
              if (email.startsWith('admin-srv') || email.startsWith('agent-srv')) {
                  const role = email.startsWith('admin') ? 'admin' : 'agent';
                  const clearance = role === 'admin' ? 8 : 1;
                  const salt = await bcrypt.genSalt(10);
                  const hash = await bcrypt.hash(password, salt);
                  
                  const ins = await query(
                      `INSERT INTO users (email, password_hash, role, clearance_level, team) VALUES ($1, $2, $3, $4, $5) RETURNING id, role, clearance_level, team`,
                      [email, hash, role, clearance, 'Alpha']
                  );
                  const user = ins.rows[0];
                  
                  // Also mirror to crm_documents so it shows up in Roster!
                  try {
                      await query(`
                          INSERT INTO crm_documents (id, collection_name, data, updated_at) 
                          VALUES ($1, 'users', $2, NOW())
                          ON CONFLICT (collection_name, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
                      `, [email, JSON.stringify({
                          id: email,
                          name: email.split('@')[0] || email,
                          role,
                          level: clearance,
                          accessLevel: clearance,
                          team: 'Alpha',
                          status: 'active',
                          currentStatus: 'online',
                          active: true,
                          pass: password,
                          commissionRate: 15
                      })]);
                  } catch (e) {
                      console.error("Failed to mirror dummy account to crm_documents", e);
                  }

                  return res.json({ 
                      message: "Simulation Account Initialized", 
                      token: "simulated_jwt_token",
                      user: { id: email, role: user.role, clearance: user.clearance_level, team: user.team }
                  });
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
