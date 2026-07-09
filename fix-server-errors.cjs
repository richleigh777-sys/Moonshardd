const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('app.use((err, req, res, next)')) {
    code = code.replace(/app\.listen\(PORT/, 
`
  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('[CRITICAL] Unhandled Express Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(PORT`);
}

if (!code.includes('unhandledRejection')) {
    code = code.replace(/async function startServer\(\) \{/, 
`
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
  // Optional: decide if you want to exit process
});

async function startServer() {`);
}

fs.writeFileSync('server.ts', code);
console.log("Server error handlers patched");
