/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const coverageFile = path.resolve(__dirname, '../coverage/coverage.json');
const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
const hacked = Object.keys(coverage).reduce((result, dir) => {
  const relative = path.relative(baseDir, dir);
  const row = { [relative]: Object.assign(coverage[dir], { path: relative }) };
  return Object.assign(result, row);
}, {});

console.log(JSON.stringify(hacked));
