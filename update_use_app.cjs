const fs = require('fs');
let content = fs.readFileSync('hooks/useAppInitialization.ts', 'utf8');
content = content.replace(
  'const [isBooting, setIsBooting] = useState(true);',
  'const [isBooting, setIsBooting] = useState(true);\n    console.log("useAppInitialization mounted, isBooting:", isBooting, "isFirebaseAuthReady:", isFirebaseAuthReady);\n    useEffect(() => { console.log("isBooting changed:", isBooting); }, [isBooting]);'
);
fs.writeFileSync('hooks/useAppInitialization.ts', content);
