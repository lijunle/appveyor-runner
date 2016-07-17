import path from 'path';
import runner from './index';
import parseConfig from './parse-config';

export default async function cli(configFile) {
  const configDir = path.dirname(configFile);
  const config = await parseConfig(configFile);

  const binDir = config.bin
    ? path.resolve(configDir, config.bin)
    : path.resolve(process.cwd(), 'node_bin');

  const logDir = config.log
    ? path.resolve(configDir, config.log)
    : path.resolve(process.cwd(), 'node_log');

  return runner(
    process.stdout,
    process.stderr,
    process.cwd(),
    binDir,
    logDir,
    config.versions,
    config.scripts,
  );
}
