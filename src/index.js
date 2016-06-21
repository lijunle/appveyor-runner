import path from 'path';

export default async function main() {
  const dirname = await path.resolve(__dirname);
  console.log(`This is file ${dirname}`); // eslint-disable-line no-console
}
