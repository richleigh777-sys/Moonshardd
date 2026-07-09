const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

if (!code.includes('ErrorBoundary')) {
    code = code.replace("import App from './App';", "import App from './App';\nimport { ErrorBoundary } from './components/ErrorBoundary';");
    code = code.replace("<App />", "<ErrorBoundary><App /></ErrorBoundary>");
    fs.writeFileSync('index.tsx', code);
    console.log("ErrorBoundary added");
}
