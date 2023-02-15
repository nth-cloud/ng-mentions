import { readJsonSync, writeJSONSync } from 'fs-extra';

const { version } = readJsonSync(`package.json`, { encoding: 'utf-8' });
const srcPackage = readJsonSync('src/package.json', { encoding: 'utf-8' });
srcPackage.version = version;
writeJSONSync('src/package.json', srcPackage, { spaces: 2, encoding: 'utf-8' });
