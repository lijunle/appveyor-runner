import os from 'os';
import fs from 'fs';
import path from 'path';
import through2 from 'through2';
import mkdirp from 'mkdirp-promise';
import download from 'download';
import childProcess from 'child_process';
import { StringDecoder } from 'string_decoder';

function access(filePath) {
  return new Promise((resolve) =>
    fs.access(filePath, (error) =>
      (error ? resolve(false) : resolve(true))
    )
  );
}

function toString() {
  const decoder = new StringDecoder('utf8');

  function transform(chunk, encoding, done) {
    done(null, decoder.write(chunk));
  }

  function end(done) {
    done(null, decoder.end());
  }

  return through2(transform, end);
}

function output(log, version, channel) {
  let last = '';

  function print(line) {
    log(`[Runner][${version}][${channel}] ${line}`);
  }

  function transform(text, encoding, done) {
    const current = last + text;
    const lines = current.split(/[\r\n]/g).filter(x => x);
    const outLines = lines.slice(0, -1);

    for (const line of outLines) {
      print(line);
    }

    last = lines.slice(-1)[0];
    done();
  }

  function end(done) {
    if (last) {
      print(last);
    }

    done();
  }

  return through2(transform, end);
}

function execute(stdout, stderr, version, script, env) {
  return new Promise((resolve, reject) => {
    stdout(`[Runner][${version}][Script] ${script}`);
    const process = childProcess.exec(script, { env });
    process.stdout.pipe(toString()).pipe(output(stdout, version, 'Stdout'));
    process.stderr.pipe(toString()).pipe(output(stdout, version, 'Stderr'));
    process.on('exit', resolve);
    process.on('error', reject);
  });
}

async function getNode(stdout, stderr, dir, version) {
  const arch = os.arch();
  const url = `https://nodejs.org/dist/v${version}/win-${arch}/node.exe`;
  const dest = path.resolve(dir, `v${version}-${arch}`);
  const node = path.resolve(dest, 'node.exe');
  const existed = await access(node);

  if (existed) {
    stdout(`[Runner][${version}] Found existing node: ${node}`);
  } else {
    stdout(`[Runner][${version}] Not found existing node, create destination folder: ${dest}`);
    await mkdirp(dest);
    stdout(`[Runner][${version}] Destination folder created, download node from: ${url}`);
    await download(url, dest);
    stdout(`[Runner][${version}] Download finished, node path: ${node}`);
  }

  return node;
}

async function run(stdout, stderr, dir, version, scripts) {
  const node = await getNode(stdout, stderr, dir, version);
  const nodeDir = path.dirname(node);
  const env = Object.assign({ PATH: `${nodeDir};${process.env.PATH}` }, process.env);
  stdout(`[Runner][${version}] Node path is added to environment: ${nodeDir}`);

  for (const script of scripts) {
    await execute(stdout, stderr, version, script, env);
  }

  stdout(`[Runner][${version}] Scripts completed.`);
}

export default async function main() {
  // TODO make as parameters
  const stdout = v => process.stdout.write(v + os.EOL);
  const stderr = v => process.stderr.write(v + os.EOL);
  const dir = process.cwd();
  const versions = ['6.2.2'];
  const scripts = ['node --version', 'npm --version', 'more index.js'];

  try {
    stdout(`[Runner] Start runner under ${dir}, with versions: ${versions}`);
    const binDir = path.resolve(dir, 'node_bin');
    await Promise.all(versions.map(v => run(stdout, stderr, binDir, v, scripts)));
    stdout('[Runner] All tasks are completed successfully!');
  } catch (error) {
    stderr('[Runner] Whoops! Get into trouble. :(');
    stderr(error);
  }
}
