import fs from 'fs';
import path from 'path';
import { Test } from 'tape';

Test.prototype.include = function include(a, b, msg, extra) {
  this._assert(a.includes(b), { // eslint-disable-line no-underscore-dangle
    message: msg || 'should include',
    operator: 'include',
    expected: b,
    actual: a,
    extra,
  });
};

Test.prototype.below = function include(a, b, msg, extra) {
  this._assert(a < b, { // eslint-disable-line no-underscore-dangle
    message: msg || 'should be below',
    operator: 'below',
    expected: b,
    actual: a,
    extra,
  });
};

function doesPathExist(targetPath) {
  try {
    fs.accessSync(targetPath);
    return true;
  } catch (e) {
    return false;
  }
}

function findUpPath(targetPath) {
  const pathDir = path.dirname(targetPath);
  return doesPathExist(pathDir)
    ? pathDir
    : findUpPath(pathDir);
}

Test.prototype.exist = function exist(targetPath, msg, extra) {
  this._assert(doesPathExist(targetPath), { // eslint-disable-line no-underscore-dangle
    message: msg || 'should exist',
    operator: 'exist',
    expected: targetPath,
    get actual() { return findUpPath(targetPath); },
    extra,
  });
};
