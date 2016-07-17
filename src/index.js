import os from 'os';
import fs from 'fs';
import path from 'path';
import through2 from 'through2';
import concat from 'concat-stream';
import mkdirp from 'mkdirp-promise';
import download from 'download';
import childProcess from 'child_process';
import { StringDecoder } from 'string_decoder';

import parseVersions from './parse-versions';

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
    if (line) {
      log(`[Runner][${version}][${channel}] ${line}`);
    }
  }

  function transform(text, encoding, done) {
    const current = last + text;
    const lines = current.split(/[\r\n]/g);
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

function execute(stdout, stderr, version, script, workingDir, env) {
  return new Promise((resolve, reject) => {
    stdout(`[Runner][${version}][Script] ${script}`);

    let content = '';
    const contentStream = concat({ encoding: 'string' }, v => (content = v));
    const process = childProcess.exec(script, { cwd: workingDir, env });
    process.on('exit', code => resolve({ code, content }));
    process.on('error', reject);

    const outStream = process.stdout.pipe(toString());
    outStream.pipe(contentStream);
    outStream.pipe(output(stdout, version, 'Stdout'));

    const errStream = process.stderr.pipe(toString());
    errStream.pipe(contentStream);
    errStream.pipe(output(stdout, version, 'Stderr'));
  });
}

async function getNode(stdout, stderr, dir, version) {
  const arch = os.arch() === 'ia32' ? 'x86' : 'x64';
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

async function run(stdout, stderr, workingDir, binDir, logDir, version, scripts) {
  const node = await getNode(stdout, stderr, binDir, version);
  const nodeDir = path.dirname(node);
  const moduleDir = path.resolve(workingDir, './node_modules/.bin');
  const env = Object.assign({ PATH: `${nodeDir};${moduleDir};${process.env.PATH}` }, process.env);
  stdout(`[Runner][${version}] Node path is added to environment: ${nodeDir}`);

  const outputFile = path.resolve(logDir, `v${version}-output.txt`);
  const outputStream = fs.createWriteStream(outputFile);
  stdout(`[Runner][${version}] Created output file: ${outputFile}`);

  let exitCode = 0;
  for (const script of scripts) {
    const result = await execute(stdout, stderr, version, script, workingDir, env);
    outputStream.write(`${os.EOL}[${result.code}] Runner> ${script}${os.EOL}`);
    outputStream.write(result.content);
    exitCode = result.code === 0 ? exitCode : -1;
  }

  outputStream.end();
  stdout(`[Runner][${version}] Scripts completed with exit code ${exitCode}.`);
  return exitCode;
}

export default async function runner(out, err, workingDir, binDir, logDir, versions, scripts) {
  const stdout = v => out.write(v + os.EOL);
  const stderr = v => err.write(v + os.EOL);
  try {
    stdout('[Runner] Start runner.');
    stdout(`[Runner] Got binary directory: ${binDir}`);

    await mkdirp(logDir);
    stdout(`[Runner] Got log directory and created: ${logDir}`);

    const targetVersions = await parseVersions(versions);
    stdout(`[Runner] Got target versions: ${targetVersions}`);

    const runs = targetVersions.map(version =>
      run(stdout, stderr, workingDir, binDir, logDir, version, scripts)
    );

    const exitCode = (await Promise.all(runs)).some(code => code !== 0) ? -1 : 0;
    stdout(`[Runner] All tasks are completed. Return exit code: ${exitCode}`);
    return exitCode;
  } catch (error) {
    stderr('[Runner] Whoops! Get into trouble. :(');
    stderr(error.message);
    stderr(error.stack);
    return -1;
  }
}
