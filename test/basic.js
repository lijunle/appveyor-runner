import test from 'tape-promise/tape';
import runner from '../src/index';

test('runner', () => runner(
  process.stdout,
  process.stderr,
  process.cwd(),
  ['6.2.2'],
  ['node --version', 'npm --version', 'more index.js >&2']
));
