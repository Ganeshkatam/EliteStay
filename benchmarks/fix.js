/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const dir = 'benchmarks';
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.ts')) continue;
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  content = content.replace(/\\'search\\'/g, "'search'");
  fs.writeFileSync(fp, content);
}
