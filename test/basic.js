import path from 'path';
import mkdirp from 'mkdirp-promise';
import tape from 'tape-promise/tape';
import runner from '../src/index';

const binDir = path.resolve(__dirname, '../node_bin');

function test(name, listener) {
  tape(name, async (t) => {
    const context = {};
    try {
      const now = Date.now().toString();
      const logDir = path.resolve(__dirname, 'logs', now);
      await mkdirp(logDir);
      context.logDir = logDir;
    } finally {
      listener(t, context);
    }
  });
}

test('runner', (t, context) => runner(
  process.stdout,
  process.stderr,
  binDir,
  context.logDir,
  ['6.2.2'],
  ['node --version', 'npm --version', 'more index.js >&2']
));
