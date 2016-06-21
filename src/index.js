import os from 'os';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp-promise';
import download from 'download';

function access(filePath) {
  return new Promise((resolve) =>
    fs.access(filePath, (error) =>
      (error ? resolve(false) : resolve(true))
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

async function run(stdout, stderr, dir, version) {
  const node = await getNode(stdout, stderr, dir, version);
  stdout(`[Runner][${version}] Got node: ${node}`);
}

export default async function main() {
  // TODO make as parameters
  const stdout = v => process.stdout.write(v + os.EOL);
  const stderr = v => process.stderr.write(v + os.EOL);
  const dir = process.cwd();
  const versions = ['6.2.2'];

  try {
    stdout(`[Runner] Start runner under ${dir}, with versions: ${versions}`);
    const binDir = path.resolve(dir, 'node_bin');
    await Promise.all(versions.map(v => run(stdout, stderr, binDir, v)));
    stdout('[Runner] All tasks are completed successfully!');
  } catch (error) {
    stderr('[Runner] Whoops! Get into trouble. :(');
    stderr(error);
  }
}
