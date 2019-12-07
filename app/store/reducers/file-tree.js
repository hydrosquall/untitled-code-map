
import {
  SET_FILE_TREE,
  SET_SEARCH_RESULTS,
  SET_FILE_PATH,
  SET_FOLDER_STRUCTURE,
  SET_REMOTE_URL
} from '../actions/file-tree';

const DEFAULT_PATH = '/Users/cameron/Projects/open-source/d3-quadtree/src';
const defaultState = {
  fileTree: undefined,
  searchResults: [], // match objects
  filePath: DEFAULT_PATH, // default thing to load
  // Temporary home for python script related state, before a new reducer is made
  folderStructure: undefined,
  remoteUrl: ''
};

// Store data relating to the dependency tree
// use selector to store filtered nodes
export default function fileTree(state = defaultState, action) {
  switch (action.type) {
    case SET_FILE_TREE:
      return { ...state, fileTree: action.payload.fileTree };
    case SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload.searchResults };
    case SET_FILE_PATH:
      return { ...state, filePath: action.payload.filePath };
    case SET_FOLDER_STRUCTURE:
      return { ...state, folderStructure: action.payload.folderStructure };
    case SET_REMOTE_URL:
      return { ...state, remoteUrl: action.payload.remoteUrl };
    default:
      return state;
  }
}
