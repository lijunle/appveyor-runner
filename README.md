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

- `bin` - The file path to download the node.js binaries. Relative or absolute path are OK. If it is relative path, relative to `appveyor-run.yml` file directory. Default to `node_bin` folder under `cwd`.
- `log` - The file path to store execute ouput. Relative or absolute path are OK, same resolution as `bin` path. Default to `node_log` folder under `cwd`.
- `cwd` - The working directory to run scripts. Relative or absolute path are OK, same resolution as `bin` path. Default to `process.cwd()` folder.
- `version` - The target execute node.js version array. Semver versions are supported. Default is empty array.
- `script` - The execute script array. The `node_modules/.bin` path is appended to `PATH` environment variable automatically. Default is empty script array.

## Example

*appveyor-runner.yml*

```yaml
bin: C:\path\to\node_dir
log: .\path\to\log_dir
cwd: .\path\to\working_dir

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
