import http from 'http';
import semver from 'semver';

const nodejsIndexUrl = 'http://nodejs.org/dist/index.json';

function getNodejsIndex() {
  return new Promise((resolve, reject) =>
    http.get(nodejsIndexUrl, (response) => {
      let content = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => (content += chunk));
      response.on('end', () => resolve(JSON.parse(content)));
    }).on('error', reject)
  );
}

export default async function parseVersions(versions) {
  const nodejsIndex = await getNodejsIndex();
  const nodeVersions = nodejsIndex.map(data => semver.clean(data.version));
  const targetVersions = versions.map(version => semver.maxSatisfying(nodeVersions, version));
  return targetVersions;
}
