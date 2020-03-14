const { readFileSync } = require('fs');

const packageJson = JSON.parse(
  readFileSync('./package.json', { encoding: 'utf8' })
);

console.log(packageJson.version);
