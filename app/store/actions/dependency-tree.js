import { send } from '../../ipc-client/client-ipc';

// Help from the backend
export const SET_DOT_GRAPH = 'SET_DOT_GRAPH'; // load data in DOT string format
export const SET_FILTER_PATTERNS = 'SET_FILTER_PATTERNS';
export const ADD_FILTER_PATTERNS = 'ADD_FILTER_PATTERNS';

// TODO: move to own reducer
export const SET_GIT_LOGS = 'SET_GIT_LOGS';


export function setDotGraph(dotGraph) {
  return {
    type: SET_DOT_GRAPH,
    payload: {
      dotGraph, // as string
    }
  };
}

// list of strings
export function setFilterPatterns(filterPatterns) {
  return {
    type: SET_FILTER_PATTERNS,
    payload: {
      filterPatterns: filterPatterns.filter(pattern => pattern.length !== 0 ), // list of javascript regex
    }
  };
}

export function addFilterPatterns(filterPatterns) {
  return {
    type: ADD_FILTER_PATTERNS,
    payload: {
      filterPatterns: filterPatterns.filter(pattern => pattern.length !== 0 ), // list of javascript regex
    }
  };
}

// array of objects with a GitLog shape
//
export function setGitLogs(gitLogs) {
  return {
    type: SET_GIT_LOGS,
    payload: {
      gitLogs
    }
  };
}

export function getDotGraph(filepath, webpackConfig) {
  return async (dispatch) => {
      // TODO: send serialized object if it's more convenient instead of dotString...
      const dependencyTreeAsDotString = await send('get-file-dependency-tree', { absPath: filepath, webpackConfig });
      dispatch(setDotGraph(dependencyTreeAsDotString));
  };
}

// TODO: move git log logic to own logic file if we add more capabilities
export function getGitLogs(filepath) {
  return async (dispatch) => {
      const logs = await send('get-git-logs', { absPath: filepath });
      // console.log(logs);
      dispatch(setGitLogs(logs));
  };
}
