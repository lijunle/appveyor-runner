import yaml from 'js-yaml';
import fs from 'fs';

function readFile(file) {
  return new Promise((resolve, reject) =>
    fs.readFile(file, 'utf-8', (error, data) =>
      (error ? reject(error) : resolve(data))
    )
  );
}

export default async function parseConfig(configFile) {
  const content = await readFile(configFile);
  const config = yaml.safeLoad(content);
  return config.runner;
}
