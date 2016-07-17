import { EOL } from 'os';
import test from './tape';
import runner from '../src/index';

test('runner should exit with 0 if everything is good', async (t, context) => {
  const code = await runner(
    context.stdout,
    context.stderr,
    __dirname,
    context.binDir,
    context.logDir,
    ['6.2.2'],
    ['node -v']
  );

  t.equal(code, 0);
});

test('runner should exit with -1 if something goes wrong', async (t, context) => {
  const code = await runner(
    context.stdout,
    context.stderr,
    __dirname,
    context.binDir,
    context.logDir,
    ['6.2.2'],
    ['not-exist-command']
  );

  t.equal(code, -1);
});

test('runner should redirect stdout', async (t, context) => {
  const output = 'This should be output to stdout!';
  const script = `node -e "console.log('${output}')"`;

  await runner(
    context.stdout,
    context.stderr,
    __dirname,
    context.binDir,
    context.logDir,
    ['6.2.2'],
    [script]
  );

  const stdout = context.getStdout();
  const stderr = context.getStderr();
  const lines = stdout.split(EOL);

  t.include(stdout, '6.2.2');
  t.include(lines, `[Runner][6.2.2][Script] ${script}`);
  t.include(lines, `[Runner][6.2.2][Stdout] ${output}`);
  t.equal(stderr, '');
});

test('runner should redirect stderr', async (t, context) => {
  const output = 'This should be output to stderr!';
  const script = `node -e "console.error('${output}')"`;

  await runner(
    context.stdout,
    context.stderr,
    __dirname,
    context.binDir,
    context.logDir,
    ['6.2.2'],
    [script]
  );

  const stdout = context.getStdout();
  const stderr = context.getStderr();
  const lines = stdout.split(EOL);

  t.include(stdout, '6.2.2');
  t.include(lines, `[Runner][6.2.2][Script] ${script}`);
  t.include(lines, `[Runner][6.2.2][Stderr] ${output}`);
  t.equal(stderr, '');
});

test('runner should run multiple versions', async (t, context) => {
  await runner(
    context.stdout,
    context.stderr,
    __dirname,
    context.binDir,
    context.logDir,
    ['4.4.6', '6.2.2'],
    ['node -e "console.log(JSON.stringify(process.versions))"']
  );

  const stdout = context.getStdout();
  t.include(stdout, '[Runner][4.4.6][Stdout]');
  t.include(stdout, '[Runner][6.2.2][Stdout]');
  t.include(stdout, '"node":"4.4.6"');
  t.include(stdout, '"node":"6.2.2"');
});

test('runner should run multiple scripts', async (t, context) => {
  await runner(
    context.stdout,
    context.stderr,
    __dirname,
    context.binDir,
    context.logDir,
    ['6.2.2'],
    ['node -e "console.log(`script-1`)"', 'node -e "console.log(`script-2`)"']
  );

  const stdout = context.getStdout();
  const lines = stdout.split(EOL);

  const expected1 = '[Runner][6.2.2][Stdout] script-1';
  const expected2 = '[Runner][6.2.2][Stdout] script-2';
  t.include(lines, expected1);
  t.include(lines, expected2);

  const index1 = lines.indexOf(expected1);
  const index2 = lines.indexOf(expected2);
  t.below(index1, index2);
});
