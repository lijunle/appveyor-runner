import fs from 'fs';
import path from 'path';
import through2 from 'through2';
import mkdirp from 'mkdirp-promise';
import tape from 'tape-promise/tape';
import { Test } from 'tape';

const binDir = path.resolve(__dirname, '../node_bin');

Test.prototype.includes = function includes(a, b, msg, extra) {
  this._assert(a.includes(b), { // eslint-disable-line no-underscore-dangle
    message: msg || 'should includes',
    operator: 'includes',
    expected: b,
    actual: a,
    extra,
  });
};

Test.prototype.below = function includes(a, b, msg, extra) {
  this._assert(a < b, { // eslint-disable-line no-underscore-dangle
    message: msg || 'should be below',
    operator: 'below',
    expected: b,
    actual: a,
    extra,
  });
};

function doesPathExist(targetPath) {
  try {
    fs.accessSync(targetPath);
    return true;
  } catch (e) {
    return false;
  }
}

function findUpPath(targetPath) {
  const pathDir = path.dirname(targetPath);
  return doesPathExist(pathDir)
    ? pathDir
    : findUpPath(pathDir);
}

Test.prototype.exists = function exists(targetPath, msg, extra) {
  this._assert(doesPathExist(targetPath), { // eslint-disable-line no-underscore-dangle
    message: msg || 'should exist',
    operator: 'exists',
    expected: targetPath,
    get actual() { return findUpPath(targetPath); },
    extra,
  });
};

function createStream() {
  let str = '';

  const stream = through2((chunk, encoding, done) => {
    str += chunk;
    done();
  });

  return {
    stream,
    str: () => str,
  };
}

function hookStream(stream) {
  let str = '';
  const originalStdoutWrite = stream._write; // eslint-disable-line no-underscore-dangle

  // eslint-disable-next-line no-param-reassign, no-underscore-dangle
  stream._write = (chunk, encoding, done) => {
    str += chunk;
    done();
  };

  return () => {
    // eslint-disable-next-line no-param-reassign, no-underscore-dangle
    stream._write = originalStdoutWrite;
    return str;
  };
}

function hookCwd(targetPath) {
  const originalCwd = process.cwd;
  process.cwd = () => targetPath;
  return () => (process.cwd = originalCwd);
}

export default function test(name, listener) {
  tape(name, async (t) => {
    // create unique log folder for each test case
    const now = Date.now().toString();
    const logDir = path.resolve(__dirname, 'logs', now);
    await mkdirp(logDir);

    // create stdout and stderr stream
    const { stream: stdout, str: getStdout } = createStream();
    const { stream: stderr, str: getStderr } = createStream();

    // assign the variables to context for test case
    const context = {
      binDir,
      logDir,
      stdout,
      stderr,
      getStdout,
      getStderr,
      hookStream,
      hookCwd,
    };

    // run the listener
    await listener(t, context);
  });
}
