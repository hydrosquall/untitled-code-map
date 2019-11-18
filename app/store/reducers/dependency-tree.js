import produce from 'immer';

import {
  SET_DOT_GRAPH,
  SET_FILTER_PATTERNS,
  ADD_FILTER_PATTERNS,
  SET_GIT_LOGS
} from '../actions/dependency-tree';

const defaultState = {
  dotGraph: 'digraph {}',
  filterPatterns: [], // list of regular expressions for excluding nodes/edges
  gitLogs: []
}

const dependencyTree = produce((draft, action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_DOT_GRAPH:
      draft.dotGraph = payload.dotGraph;
      break;
    case SET_FILTER_PATTERNS:
      draft.filterPatterns = payload.filterPatterns;
      break;
    case ADD_FILTER_PATTERNS:
      draft.filterPatterns = draft.filterPatterns.concat(payload.filterPatterns);
      break;
    case SET_GIT_LOGS:
      draft.gitLogs = payload.gitLogs;
      break;
    // default not required by immer
  }
}, defaultState); // Immer pattern per https://github.com/immerjs/immer/issues/105

export default dependencyTree;
