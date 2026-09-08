// scripts/update-test-imports.js
const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files = files.concat(findFiles(p));
    else if (e.isFile() && p.endsWith('.ts')) files.push(p);
  }
  return files;
}

const testsDir = path.resolve(__dirname, '..', 'tests');
const target = path.resolve(__dirname, '..', 'src', 'fixtures', 'test.ts');

const files = findFiles(testsDir);
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s*\{\s*test\s*,\s*expect\s*\}\s*from\s*['"]@playwright\/test['"];?/;
  if (!importRegex.test(content)) continue;
  const rel = path.relative(path.dirname(file), target).replace(/\\/g, '/').replace(/\.ts$/, '');
  const newImport = `import { test, expect } from '${rel}';`;
  content = content.replace(importRegex, newImport);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated', file, '->', rel);
}