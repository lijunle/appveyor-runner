/* eslint-disable no-console */

const childProcess = require('child_process');

const outputStream = childProcess.execSync('git status --short');
const output = outputStream.toString();

if (output) {
  console.error('Git repo is dirty. Detect following files:');
  console.error(output);
  process.exitCode = -1;
} else {
  console.log('Awesome! Git repo is clean.');
}
