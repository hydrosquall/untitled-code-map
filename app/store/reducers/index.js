import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import {
  DEPENDENCY_TREE_REDUCER_KEY,
  FILE_TREE_REDUCER_KEY
} from '../constants';

import dependencyTree from './dependency-tree';
import fileTree from './file-tree';

export default function createRootReducer(history) {
  return combineReducers({
    router: connectRouter(history),
    [DEPENDENCY_TREE_REDUCER_KEY]: dependencyTree,
    [FILE_TREE_REDUCER_KEY]: fileTree
  });
}
