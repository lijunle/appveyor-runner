import path from 'path';
import runner from './index';

export default function cli() {
  return runner(
    process.stdout,
    process.stderr,
    path.resolve(process.cwd(), 'node_bin'),
    path.resolve(process.cwd(), 'node_log'),
    ['6.2.2'],
    ['node --version', 'npm --version', 'more index.js >&2']
  );
}
