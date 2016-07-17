import path from 'path';
import { execSync } from 'child_process';
import { EOL } from 'os';
import test from './tape';
import runner from '../src/index';

test('npm should append .bin to environment path', async (t, context) => {
  await runner(
    context.stdout,
    context.stderr,
    path.resolve(__dirname, './scripts/npm'),
    context.binDir,
    context.logDir,
    ['6.2.2'],
    ['npm run show-path']
  );

  const stdout = context.getStdout();
  const npmBinDir = path.resolve(__dirname, './scripts/npm/node_modules/.bin');
  t.include(stdout, npmBinDir);
});

test('npm should output line by line', async (t, context) => {
  const script = 'npm run show-random';
  const npmScriptDir = path.resolve(__dirname, './scripts/npm');

  await runner(
    context.stdout,
    context.stderr,
    npmScriptDir,
    context.binDir,
    context.logDir,
    ['6.2.2'],
    [script]
  );

  const execOut = execSync(script, { cwd: npmScriptDir });
  const execLines = execOut.toString().split(/[\r\n]/g).filter(x => x);

  const testOut = context.getStdout();
  const testLines = testOut.split(EOL).filter(x => x);

  // Get the index of each execLine in testLines.
  const execIndexes = execLines.map(execLine => {
    for (let i = 0; i < testLines.length; i++) {
      const testLine = testLines[i];
      if (testLine.includes(execLine)) {
        return i;
      }
    }

    t._assert(false, { // eslint-disable-line no-underscore-dangle
      message: 'should contain in line',
      operator: 'contain in line',
      expected: execLine,
      actual: testLines,
    });

    return Number.MAX_VALUE;
  });

  execIndexes.reduce((a, b, currentIndex) => {
    const prevExecLine = execLines[currentIndex - 1];
    const currExecLine = execLines[currentIndex];
    const mapTestLine = testLines[b];

    t._assert(a < b, { // eslint-disable-line no-underscore-dangle
      message: 'should before line',
      operator: 'before line',
      expected: [prevExecLine, currExecLine],
      actual: mapTestLine,
    });

    return b;
  });
});
