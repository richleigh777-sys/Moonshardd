import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { query } from "./lib/db"; // Secure DB Gateway

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

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
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
