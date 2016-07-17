import path from 'path';
import runner from './index';
import parseConfig from './parse-config';

export default async function cli(configFile = 'appveyor-runner.yml') {
  const configDir = path.dirname(path.resolve(process.cwd(), configFile));
  const config = await parseConfig(configFile);

  const cwd = config.cwd
    ? path.resolve(configDir, config.cwd)
    : process.cwd();

  const binDir = config.bin
    ? path.resolve(configDir, config.bin)
    : path.resolve(process.cwd(), 'node_bin');

  const logDir = config.log
    ? path.resolve(configDir, config.log)
    : path.resolve(process.cwd(), 'node_log');

  return runner(
    process.stdout,
    process.stderr,
    cwd,
    binDir,
    logDir,
    config.version || [],
    config.script || [],
  );
}
