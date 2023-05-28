const fs = require('fs');
const versionFile = 'src/meta/version.js';
const metaPrefix = '// @version      ';

let contents = fs.readFileSync(versionFile, 'utf-8');
let current = [];
current = contents.split('@version')[1].trim().split('.');
current = current.map(x => parseInt(x))
current[2]++;
if (current[2] > 99) {
    current[1]++;
    current[2] = 0;
}
if (current[1] > 9) {
    current[0]++;
    current[1] = 0;
}
contents = `${metaPrefix}${current.join('.')}`
fs.writeFileSync(versionFile, contents);
