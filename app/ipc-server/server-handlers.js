// Run other scripts
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
const handlers = {};

handlers['get-file-dependency-tree'] = async payload => {
  console.log('Generating Madge Dependency Tree');

  // get relative path to current location
  const { absPath, webpackConfig } = payload;
  const relativePath = path.relative(process.env.PWD, absPath);

  const config = {
    fileExtensions: ['js', 'jsx', 'ts', 'tsx']
  };
  if (webpackConfig) {
    config.webpackConfig = webpackConfig;
  }

  const result = await madge(relativePath, config)
    .then(
      res =>
        // console.log(res)
        res
    )
    .then(res => res.dot())
    .catch(error => {
      console.log(error);
    });
  return result;
};

handlers['get-directory-tree'] = async payload => {
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
    options.regex = searchRegex;
  }

  // In future: support ripgrep RUST flavored regex
  const results = await rg(absPath, options); // result contains line, column, match, file
  console.log(`Found ${results.length} matches`);
  return results;
};

handlers['get-git-logs'] = async payload => {
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
    fields: ['authorName', 'committerDate', 'subject', 'abbrevHash'],
    file: absPath,
    number: 20
  };

  return gitlog(options);
};

// Call Amelia's python script:
function execShellCommand(cmd) {
  const exec = require('child_process').exec;
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

// Use a shell command to get the required data structure
async function getFolderStructureShell(absPath) {
  const command = `./app/ipc-server/folder_structure_to_json.py ${absPath}`;
  console.log('Running command');
  console.log(command);
  const hierarchy = await execShellCommand(command).then(response => {
    const parsed = JSON.parse(response);
    return parsed;
  });
  return hierarchy;
}

async function getFolderStructureNode(absPath) {
  // Let's find the current git repository for that particular file
  // Use the promise version instead of the callback: https://www.npmjs.com/package/simple-git
  const gitDirectory = await git(absPath).revparse(['--show-toplevel']);
  const logOptions = {
    repo: gitDirectory,
    fields: ['committerDate'],
    number: 1000 // arbitrary maximum limit to avoid timing out requests. # of commits to look back.
  };

  let itemCount = 0;
  const relativePath = path.relative(process.env.PWD, absPath);
  const hierarchy = directoryTree(
    relativePath,
    { exclude: [/node_modules/, /\.git/] },
    (item, PATH, status) => {
      // 0th: apply an item id
      item.id = itemCount;
      itemCount = itemCount + 1;

      // First, apply folder type
      if (item.type === 'directory') {
        item.type === 'folder'; // backwards compat with the python script
        // If it's a folder, there won't be any git metadata about it.
        return;
      } else {
        const { extension } = item;
        if (extension.startsWith('.')) {
          item.type = extension.substr(1); // only remove first ., to account for double . extensions like .d.ts
        } else {
          item.type = 'text';
        }
      }

      // Then, supply git metadata
      const localPath = path.resolve(item.path);
      // If file has been .gitignored, it won't have data.
      const lastEdit = gitlog({ ...logOptions, file: localPath, number: 1 })[0];
      item.last_edit = lastEdit ? lastEdit.committerDate : '';
      item.num_of_edits = gitlog({ ...logOptions, file: localPath }).length;

      // Lastly, let's pull the absolute path off to shrink the payload
      item.path = item.path.split(relativePath)[1];
    }
  );
  return hierarchy;
}

handlers['get-folder-structure'] = async payload => {
  console.log(
    'Getting directory structure, OS, and git metadata from the filesystem'
  );
  const { absPath } = payload;
  const useShell = false; // toggle if the node script is broken.
  if (useShell) {
    return await getFolderStructureShell(absPath);
  } else {
    // const remotes = await getRemoteUrl(absPath);
    return getFolderStructureNode(absPath);
  }
};

async function getRemotes(absPath) {
  const isVerbose = true; // include URLs and purpose
  return await git(absPath).getRemotes(isVerbose);
}

const removeSuffix = (text, suffix) => {
  return text.split(suffix)[0];
};

handlers['get-remote-url'] = async payload => {
  console.log(
    'attempt to guess the URL needed to open remote links for these files'
  );
  const { absPath } = payload;
  const remotes = await getRemotes(absPath);
  // Find the primary remote
  const originRemote = remotes.find(remote => remote.name === 'origin');
  if (originRemote) {
    const { fetch } = originRemote.refs;
    // Need to get HTTP url if it doesn't start with HTTPs... handle my case first, adapt to HTTPs too.
    if (fetch.startsWith('git@github.com:')) {
      const repositoryWithExtension = fetch.split('git@github.com:')[1];
      const [
        organization,
        projectWithExtension
      ] = repositoryWithExtension.split('/');
      const project = removeSuffix(projectWithExtension, '.git');
      console.log({
        project,
        organization
      });
      // assume there exists a default branch called master
      return `https://github.com/${organization}/${project}/blob/master`;
    } else {
      return `${removeSuffix(fetch, '.git')}/blob/master`;
    }
  }

  return ''; // TODO: maybe in this case, open file on filesystem instead
};

module.exports = handlers;
