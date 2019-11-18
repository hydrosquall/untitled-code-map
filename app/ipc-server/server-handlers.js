// Run other scripts
const { exec } = require('child_process');
const util = require('util');

// Filepaths
const path = require('path');

// Dependency Tree
const madge = require('madge');

// Git Statistics
const git = require('simple-git/promise');
const gitlog = require('gitlog');

// Filetree
const rg = require('ripgrep-js');
const directoryTree = require('directory-tree');


// Based on https://github.com/jlongster/electron-with-server-example/blob/master/server-handlers.js
const handlers = {}

handlers['get-file-dependency-tree'] = async (payload) => {
  console.log('Generating Madge Dependency Tree');

  // get relative path to current location
  const { absPath, webpackConfig } = payload;
  const relativePath = path.relative(process.env.PWD, absPath)

  const config = {
    fileExtensions: ['js', 'jsx', 'ts', 'tsx']
  };
  if (webpackConfig) {
    config.webpackConfig = webpackConfig;
  }

  const result = await madge(relativePath, config)
    .then(res =>
      // console.log(res)
       res
    )
    .then(res => res.dot())
    .catch(error => {
      console.log(error);
    })
    ;

  return result;
}

handlers['get-directory-tree'] = async (payload) => {
  console.log('Getting directory structure');

  // get relative path to current location
  const { absPath } = payload;
  const relativePath = path.relative(process.env.PWD, absPath);

  return directoryTree(relativePath);
};

handlers['get-ripgrep-results'] = async payload => {
  console.log('Run a search using ripgrep');

  // get relative path to current location
  // defaultGlobs [ '*.jsx?', '*.tsx?']
  const { absPath, searchText, searchRegex = '', globs = [] } = payload;

  const options = { string: searchText, globs };

  if (searchText) {
    options.string = searchText;
  } else {
    options.regex = searchRegex
  }

  // In future: support ripgrep RUST flavored regex
  const results = await rg(absPath, options); // result contains line, column, match, file
  console.log(`Found ${results.length} matches`);
  return results;
};


handlers['get-git-logs'] = async (payload) => {
  console.log('getting git log data');

  const { absPath } = payload;
  const parentFolder = path.dirname(absPath);

    // Let's find the current git repository for that particular file
    // Use the promise version instead of the callback: https://www.npmjs.com/package/simple-git
  const gitDirectory = await git(parentFolder).revparse(['--show-toplevel']);

  // Then, we'll get the git history for that file!
  // https://github.com/domharrington/node-gitlog#optional-fields
  const options = {
    repo: gitDirectory,
    fields: [
      'authorName',
      'committerDate',
      'subject',
      'abbrevHash'
    ],
    file: absPath,
    number: 20
  }

  let commits = gitlog(options);
  return commits;
};

// Call Amelia's python script:
function execShellCommand(cmd) {
 const exec = require('child_process').exec;
 return new Promise((resolve, reject) => {
  exec(cmd, (error, stdout, stderr) => {
   if (error) {
    console.warn(error);
   }
   resolve(stdout? stdout : stderr);
  });
 });
}

handlers['get-folder-structure-python'] = async payload => {
  console.log('Getting directory structure from python script, along with OS metadata');
  // get relative path to current location
  const { absPath } = payload;
  const relativePath = path.relative(process.env.PWD, absPath);
  const command = `./app/ipc-server/folder_structure_to_json.py ${absPath}`;
  console.log("Running command");
  console.log(command);
  //relative to project root
  const hierarchy = await execShellCommand(command).then(response => {
    const parsed = JSON.parse(response);
    console.log(parsed);
    return parsed;
  })

  return hierarchy;
};

module.exports = handlers
