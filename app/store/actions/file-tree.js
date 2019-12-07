import { send } from '../../ipc-client/client-ipc';

// Help from the backend
export const SET_FILE_TREE = 'SET_FILE_TREE'; // actual data
export const SET_FOLDER_STRUCTURE = 'SET_FOLDER_STRUCTURE'; // actual data
export const SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS'; // list of result objects
export const SET_FILE_PATH = 'SET_FILE_PATH'; // path to imported file


export function setFileTree(fileTree) {
  return { type: SET_FILE_TREE, payload: { fileTree } }; // as string
}

export function setFolderStructure(folderStructure) {
  return { type: SET_FOLDER_STRUCTURE, payload: { folderStructure } }; // as string
}

export function setSearchResults(searchResults) {
  return { type: SET_SEARCH_RESULTS, payload: { searchResults } }; // as string
}

export function setFilePath(filePath) {
  return { type: SET_FILE_PATH, payload: { filePath } }; // as string
}


export function getFileTree(folderPath) {
  return async (dispatch) => {
      const fileTree = await send('get-directory-tree', { absPath: folderPath });
      dispatch(setFileTree(fileTree));
  };
}

export function getSearchResults(searchText, folderPath) {
  return async (dispatch) => {
      const results = await send('get-ripgrep-results', {
        absPath: folderPath,
        searchText
      });
      dispatch(setSearchResults(results));
  };
}

// Amelia's Script
// temporarily overload
export function getFolderStructure(folderPath) {
  return async (dispatch) => {
      const folderStructure = await send('get-folder-structure', {
        absPath: folderPath
      });
      dispatch(setFolderStructure(folderStructure));
  };
}
