import test from './tape';
import runner from '../src/index';

test('runner should exit politely if create directory fail', async (t, context) => {
  const code = await runner(
    context.stdout,
    context.stderr,
    __dirname,
    __filename, // cannot create bin directory same with file name
    context.logDir,
    ['6.2.2'],
    ['node -v']
  );

  t.equal(code, -1);

  const stderr = context.getStderr();
  t.include(stderr, '[Runner] Whoops! Get into trouble. :(');
  t.include(stderr, `EEXIST: file already exists, mkdir '${__filename}'`);
});

test('runner should exit politely if version cannot be parsed', async (t, context) => {
  const code = await runner(
    context.stdout,
    context.stderr,
    __dirname,
    context.binDir,
    context.logDir,
    ['INVALID'],
    ['node -v']
  );

  t.equal(code, -1);

  const stderr = context.getStderr();
  t.include(stderr, '[Runner] Whoops! Get into trouble. :(');
  t.include(stderr, 'Verson INVALID does not satisfy any node.js versions');
});
