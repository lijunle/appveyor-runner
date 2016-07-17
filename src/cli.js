import path from 'path';
import runner from './index';
import parseConfig from './parse-config';

export default async function cli(configFile) {
  const config = await parseConfig(configFile);
  return runner(
    process.stdout,
    process.stderr,
    process.cwd(),
    path.resolve(process.cwd(), 'node_bin'),
    path.resolve(process.cwd(), 'node_log'),
    config.versions,
    config.scripts,
  );
}
