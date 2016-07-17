import path from 'path';
import test from './tape';
import cli from '../src/cli';

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
