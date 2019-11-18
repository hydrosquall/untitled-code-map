import { createSelector } from 'reselect';
// import { network } from 'vis-network';
import { treeToList } from 'tree-walk-util';
import { groupBy } from 'lodash';
import path from 'path';

import { FILE_TREE_REDUCER_KEY } from '../constants';

// Suffix all selectors with $ instead of writing "selector"
const fileTreeState$ = (rootState) => rootState[FILE_TREE_REDUCER_KEY];

export const filePath$ = createSelector(
  fileTreeState$,
  state => state.filePath
);

export const folderStructure$ = createSelector(
  fileTreeState$,
  state => state.folderStructure
);

// DOT format string
export const fileTree$ = createSelector(
  fileTreeState$,
  state => state.fileTree
);

export const searchResults$ = createSelector(
  fileTreeState$,
  state => state.searchResults
);

// Search results by file

// key: filename, value: Match[]
const searchResultsByFileMap$ = createSelector(
  searchResults$,
  searchResults => groupBy(searchResults, result => result.file )
);

export const searchResultsByFileList$ = createSelector(
  searchResultsByFileMap$,
  searchResultsByFileMap => Object.entries(searchResultsByFileMap).map(
      ([file, matches]) => ({ file, match: matches.length })
    )
);


const ALLOW_FILES = true;

// Resolve relative paths into abs paths.
export const searchResultsByFileMapResolved$ = createSelector(
  searchResultsByFileMap$,
  filePath$,
  (searchResultsByFileMap, filePath) => {

    const newMap = {};
    Object.entries(searchResultsByFileMap).forEach(([file, matches]) => {
      newMap[path.join(filePath, file)] = matches;
    });
    return newMap;
  }
);

export const fileTreeList$ = createSelector(
  fileTree$,
  searchResultsByFileMapResolved$,
  (tree, searchResultsByFile)=> {
  if (!tree) {
    return;
  }

  const nodes = treeToList(tree).filter(node => ALLOW_FILES || node.type === 'directory');

  console.log(searchResultsByFile);


  const cytoscapeElements = nodes.flatMap(node => {
    const edges = node.children && node.children.map(child => {
      if (!ALLOW_FILES && child.type !== 'directory') {
        return null
      }
      return { data: {source: node.path, target: child.path} }
      }).filter(edge => edge !== null) || [];

    // Lets see if there are any search results for this node
    const nodeData = {
      id: node.path,
      size: node.size,
      type: node.type,
      matches: 0
    };

    const fullPath = path.resolve(node.path);
    const matches = searchResultsByFile[fullPath];
    if (matches) {
      nodeData.matches = matches.length
      nodeData.matchData = matches
    }

    nodeData.label = `${node.name} | ${nodeData.matches}`;

    return [
        // node
        { data: nodeData },
        // edges
        ...edges
      ]
  });

  return cytoscapeElements;
  });



export default {
  fileTree$,
  fileTreeList$,
  // visNetworkGraph$,
  // networkXGraph$
};
