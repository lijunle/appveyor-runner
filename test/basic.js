import path from 'path';
import test from './tape';
import runner from '../src/index';

const binDir = path.resolve(__dirname, '../node_bin');

test('runner', async (t, context) => {
  await runner(
    context.stdout,
    context.stderr,
    binDir,
    context.logDir,
    ['6.2.2'],
    ['node --version']
  );

  const stdout = context.getStdout();
  const stderr = context.getStderr();

  t.includes(stdout, 'node --version');
  t.includes(stdout, '6.2.2');
  t.equal(stderr, '');
});
