import runner from './index';

export default function cli() {
  return runner(
    process.stdout,
    process.stderr,
    process.cwd(),
    ['6.2.2'],
    ['node --version', 'npm --version', 'more index.js >&2']
  );
}
