import path from 'path';
import runner from './index';
import parseConfig from './parse-config';

export default async function cli(configFile = 'appveyor-runner.yml') {
  const configDir = path.dirname(path.resolve(process.cwd(), configFile));
  const config = await parseConfig(configFile);

  const workingDir = config.working_dir
    ? path.resolve(configDir, config.working_dir)
    : process.cwd();

  const binDir = config.bin_dir
    ? path.resolve(configDir, config.bin_dir)
    : path.resolve(workingDir, 'node_bin');

  const logDir = config.log_dir
    ? path.resolve(configDir, config.log_dir)
    : path.resolve(workingDir, 'node_log');

  return runner(
    process.stdout,
    process.stderr,
    workingDir,
    binDir,
    logDir,
    config.version || [],
    config.script || [],
  );
}
