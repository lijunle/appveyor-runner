import os from 'os';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp-promise';
import download from 'download';
import childProcess from 'child_process';

function access(filePath) {
  return new Promise((resolve) =>
    fs.access(filePath, (error) =>
      (error ? resolve(false) : resolve(true))
    )
  );
}

function execute(script, env) {
  return new Promise((resolve, reject) =>
    childProcess.exec(script, { env }, (error, stdout, stderr) =>
      (error ? reject(error) : resolve({ stdout, stderr }))
    )
  );
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
    stdout(`[Runner][${version}][Script] ${script}`);
    const { stdout: out, stderr: err } = await execute(script, env);
    stdout(`[Runner][${version}][Stdout] ${out.trim()}`);
    stdout(`[Runner][${version}][Stderr] ${err.trim()}`);
  }

  stdout(`[Runner][${version}] Scripts completed.`);
}

export default async function main() {
  // TODO make as parameters
  const stdout = v => process.stdout.write(v + os.EOL);
  const stderr = v => process.stderr.write(v + os.EOL);
  const dir = process.cwd();
  const versions = ['6.2.2'];
  const scripts = ['node --version', 'npm --version'];

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
