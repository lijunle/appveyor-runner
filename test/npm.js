import path from 'path';
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
  t.includes(stdout, npmBinDir);
});
