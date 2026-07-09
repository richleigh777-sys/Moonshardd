const fs = require('fs');
let data = JSON.parse(fs.readFileSync('metadata.json', 'utf8'));
data.name = "My Pipe";
data.description = "Enterprise CRM Vanguard for seamless inbound marketing and workflow automation.";
fs.writeFileSync('metadata.json', JSON.stringify(data, null, 2));
