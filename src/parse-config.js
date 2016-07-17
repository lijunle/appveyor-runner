import yaml from 'js-yaml';
import fs from 'fs';

/**
 * Read the content from the file.
 * @param {string} file The file path.
 * @returns {string} The promise resolved with the file content.
 */
function readFile(file) {
  return new Promise((resolve, reject) =>
    fs.readFile(file, 'utf-8', (error, data) =>
      (error ? reject(error) : resolve(data))
    )
  );
}

/**
 * Parse configuration from file.
 * @export
 * @param {string} configFile The configuration file path. It is YAML format.
 * @returns {object} The configuration object.
 */
export default async function parseConfig(configFile) {
  const content = await readFile(configFile);
  const config = yaml.safeLoad(content);
  return config || {};
}
