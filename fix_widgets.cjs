const fs = require('fs');
const path = require('path');

const widgetsDir = path.join(__dirname, 'components/widgets');
const files = fs.readdirSync(widgetsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(widgetsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/bg-surface-main\/40/g, 'bg-surface-widget').replace(/bg-surface-main\/30/g, 'bg-surface-widget');
  fs.writeFileSync(filePath, content);
}
