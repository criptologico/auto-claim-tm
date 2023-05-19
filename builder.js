/**
 * Custom builder
 * 1- Starting from main.js, reads all placeholders recursively to inject the .js files
 * 2- Removes all comment lines after // ==/UserScript==
 * 3- Removes all console.log lines
 * 4- <<temporary>> Removes all shared.devlog lines
 */

const fs = require('fs');

/**
 * removeTrailingLines: returns the string without empty lines at the end 
 */
String.prototype.removeTrailingLines = function() {
    let str = this;
    while(str.endsWith('\n')) {
        str = str.slice(0, -1);
    }
    return str;
};

/**
 * replacePlaceholders: calls mixer for each {{file}} placeholder
 */
String.prototype.replacePlaceholders = function() {
    let str = this;
    const phRegex = /{{([^}]+)}}/g;
    return str.replace(phRegex, (_, fName) => mixer(fName.trim()));
};


/**
 * mixer: Reads the content of file, trims it, 
 * removes empty lines at the end and 
 * replaces {{file}} placeholdes recursively
 */
const mixer = (file) => fs.readFileSync(file, 'utf-8').trim().removeTrailingLines().replacePlaceholders();

let contents = mixer('main.js');

// Remove all commented lines after '==/UserScript=='
let lines = contents.split('\n');
const endMetaLineNumber = lines.findIndex(x => x.includes('==/UserScript=='));
if (endMetaLineNumber < 0) {
    console.error('Metadata end line not found');
    return;
}

let filteredLines = lines.filter((line, index) => {
  if (index <= endMetaLineNumber) {
    return true;
  }
  let tempLine = line.trim();
  if (tempLine.startsWith('//')) {
    return false;
  } else {
    return true;
  }
});

// Remove all lines that contain console.log
filteredLines = filteredLines.filter((line) => {
  let tempLine = line.trim();
  if (tempLine.startsWith('console.log') && tempLine.includes(');')) {
    return false;
  } else {
    return true;
  }
});

// Remove all lines that contain shared.devlog
filteredLines = filteredLines.filter((line, index) => {
  let tempLine = line.trim();
  if (tempLine.startsWith('shared.devlog') && tempLine.includes(');')) {
    return false;
  } else {
    return true;
  }
});

// Remove whitespaces if line is empty
filteredLines = filteredLines.map((line) => {
    let tempLine = line.trim();
    if (tempLine == '') {
        return tempLine;
    } else {
        return line;
    }
});

// Remove double empty lines
filteredLines = filteredLines.filter((line, idx) => {
    if (idx == 0) {
        return true;
    }
    let previous = filteredLines[idx - 1];
    if (previous == '' && line == '') {
        return false;
    }
    return true;
});

// Join the modified lines back into a single string
const modifiedContents =filteredLines.join('\n');

// Write the modified contents to /dist
fs.writeFileSync('dist/autoclaim-dist.user.js', modifiedContents);
fs.writeFileSync('dist/autoclaim-v3-beta.user.js', modifiedContents);
