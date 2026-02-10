const fs = require('fs');
const path = require('path');
const distDir = path.join(__dirname, '../dist');
const mainPath = path.join(distDir, 'main.js');
fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(mainPath, "require('./apps/api/src/main.js');\n");
