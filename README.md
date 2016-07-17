# appveyor-runner

Run multiple node.js versions on one AppVeyor worker.

[![Build status](https://ci.appveyor.com/api/projects/status/30r06l832xcr2eot/branch/master?svg=true)](https://ci.appveyor.com/project/lijunle/appveyor-runner/branch/master)
[![codecov](https://codecov.io/gh/lijunle/appveyor-runner/branch/master/graph/badge.svg)](https://codecov.io/gh/lijunle/appveyor-runner)
[![Dependency Status](https://david-dm.org/lijunle/appveyor-runner.svg)](https://david-dm.org/lijunle/appveyor-runner)
[![devDependency Status](https://david-dm.org/lijunle/appveyor-runner/dev-status.svg)](https://david-dm.org/lijunle/appveyor-runner#info=devDependencies)

## Installation

```
npm install --save-dev appveyor-runner
```

## Usage

1. Create file `appveyor-runner.yml` under project folder. Reference [schema](#schema) and [example](#example) for file content.
2. Write `node_modules\.bin\appveyor-runner` under `test_script` block in `appveyor.yml` file.

## Schema

- `working_dir` - The working directory to run scripts. Default to `process.cwd()` folder.
- `bin` - The file path to download the node.js binaries. Default to `node_bin` folder under `working_dir`.
- `log` - The file path to store execute ouput. Default to `node_log` folder under `working_dir`.
- `version` - The target execute node.js version array. Semver versions are supported. Default is empty array.
- `script` - The execute script array. The `node_modules/.bin` path is appended to `PATH` environment variable automatically. Default is empty script array.

For the directories, either relative or absolute path are OK. If it is relative path, it is resolved to `appveyor-run.yml` file directory.

## Example

*appveyor-runner.yml*

```yaml
working_dir: .\path\to\working_dir
bin: C:\path\to\node_dir
log: .\path\to\log_dir

version:
  - 4.x
  - 6.x

script:
  - node --version
  - npm --version
  - npm run test
```

*appveyor.yml*

```yaml
install:
  - npm -g install npm@3 && set PATH=%APPDATA%\npm;%PATH%
  - npm install

test_script:
  - node_modules\.bin\appveyor-runner

build: off
```

## Limitation

- The test cases must be run in different *context*. It means, two test cases cannot write to the same file. Use temporary file or folder to resolve this issue.
- The project cannot use packages depending on *node-gyp*. The *node-gyp* package couples with specified node.js version. No effective solution is found for this issue.

## Changelog

We use the [Github release page](https://github.com/lijunle/appveyor-runner/releases) to manage changelog.

## License

MIT License.
