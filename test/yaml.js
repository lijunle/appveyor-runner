import path from 'path';
import test from './tape';
import cli from '../src/cli';

test('CLI should default config file to appveyor-runner.yml', async (t, context) => {
  const getStdout = context.hookStream(process.stdout);
  const restoreCwd = context.hookCwd(path.resolve(__dirname, './configs'));

  const code = await cli();
  t.equal(code, 0);

  const stdout = getStdout();
  t.includes(stdout, 'Default to appveyor-runner.yml file');

  restoreCwd();
});

test('CLI should parse config and run scripts', async (t, context) => {
  const getStdout = context.hookStream(process.stdout);

  const configFile = path.resolve(__dirname, './configs/fixture-1.yml');
  const code = await cli(configFile);

  t.equal(code, 0);

  const stdout = getStdout();
  t.includes(stdout, '4.4.6');
  t.includes(stdout, '6.2.2');
  t.includes(stdout, 'First');
  t.includes(stdout, 'Second');
});

test('CLI should parse bin and log dir from config', async (t, context) => {
  const getStdout = context.hookStream(process.stdout);

  const configFile = path.resolve(__dirname, './configs/fixture-2.yml');
  const code = await cli(configFile);

  t.equal(code, 0);

  const stdout = getStdout();
  t.includes(stdout, 'Check bin and log directories');

  const arch = process.arch === 'ia32' ? 'x86' : 'x64';
  const binPath = path.resolve(__dirname, `./configs/fixture-2/bin/v6.2.2-${arch}/node.exe`);
  t.exists(binPath);

  const logPath = path.resolve(__dirname, './configs/fixture-2/log/v6.2.2-output.txt');
  t.exists(logPath);
});

test('CLI should parse cwd from config', async (t, context) => {
  const getStdout = context.hookStream(process.stdout);

  const configFile = path.resolve(__dirname, './configs/fixture-3.yml');
  const code = await cli(configFile);

  t.equal(code, 0);

  const stdout = getStdout();
  t.includes(stdout, 'Here is fixture-3 test content.');
});
