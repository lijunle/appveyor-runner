import test from './tape';
import runner from '../src/index';

test('runner should parse node.js semver and run with it', async (t, context) => {
  await runner(
    context.stdout,
    context.stderr,
    __dirname,
    context.binDir,
    context.logDir,
    ['5.x'],
    ['node -v', 'echo Finish']
  );

  const stdout = context.getStdout();

  // Version 5 has stopped development and maintain, this version will not change any more.
  t.includes(stdout, '5.12.0');
  t.includes(stdout, 'Finish');
});
