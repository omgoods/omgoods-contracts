const { readdirSync, statSync } = require('fs');
const { join, relative } = require('path');

/**
 * @type {string}
 */
const CONTRACTS_ROOT = join(__dirname, 'contracts');

/**
 * @param fileName {string}
 * @param filePath {string}
 * @returns {boolean}
 */
function isMock(fileName, filePath) {
  return fileName.endsWith('Mock.sol') || filePath.includes('__mocks__');
}

/**
 * @param fileName {string}
 * @returns {boolean}
 */
function isInterface(fileName) {
  const temp = fileName.slice(0, 2);

  return temp.startsWith('I') && temp.toUpperCase() === temp;
}

/**
 * @param fileName {string}
 * @returns {boolean}
 */
function startWithLowerCase(fileName) {
  const temp = fileName[0];

  return temp === temp.toLowerCase();
}

/**
 * @param rootPath {string}
 * @returns {string[]}
 */
function readSkippedPaths(rootPath) {
  let results = [];

  const itemNames = readdirSync(rootPath);

  for (const itemName of itemNames) {
    const itemPath = join(rootPath, itemName);

    let itemStats;

    try {
      itemStats = statSync(itemPath);
    } catch (err) {
      //
    }

    if (itemStats) {
      if (itemStats.isDirectory()) {
        results = results.concat(readSkippedPaths(itemPath));
      } else if (
        itemStats.isFile() &&
        (startWithLowerCase(itemName) ||
          isMock(itemName, itemPath) ||
          isInterface(itemName))
      ) {
        results.push(itemPath);
      }
    }
  }

  return results;
}

const skipFiles = readSkippedPaths(CONTRACTS_ROOT).map((path) =>
  relative(CONTRACTS_ROOT, path),
);

module.exports = {
  skipFiles,
};
