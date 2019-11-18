import { createSelector } from 'reselect';
import { network } from 'vis-network';
import { groupBy, pick, pipe, map } from 'lodash/fp';
import { parse } from 'date-fns/esm'

import { DiGraph } from 'jsnetworkx';

import { DEPENDENCY_TREE_REDUCER_KEY } from '../constants';

// Suffix all selectors with $ instead of writing "selector"
const dependencyTreeState$ = rootState =>
  rootState[DEPENDENCY_TREE_REDUCER_KEY];

// DOT format string
export const dotGraph$ = createSelector(
  dependencyTreeState$,
  dependencyTree => dependencyTree.dotGraph
);

export const filterPatterns$ = createSelector(
  dependencyTreeState$,
  dependencyTree => dependencyTree.filterPatterns
);

export const gitLogs$ = createSelector(
  dependencyTreeState$,
  dependencyTree => dependencyTree.gitLogs
);


// Derived Selectors
export const filterRegex$ = createSelector(
  filterPatterns$,
  filterPatterns => {
    // Prevent bug with empty strings.
    return filterPatterns
      .filter(pattern => pattern.length > 0)
      .map(pattern => new RegExp(pattern));
  }
);

// return object of nodes and edges suitable for vis-network package.
export const visNetworkGraphRaw$ = createSelector(
  dotGraph$,
  dotString => {
    if (!dotString) {
      return {
        nodes: [],
        edges: []
      };
    }
    const graph = network.convertDot(dotString);
    return {
      nodes: graph.nodes,
      edges: graph.edges
    };
  }
);

// Apply the official filtered graph.
export const visNetworkGraph$ = createSelector(
  visNetworkGraphRaw$,
  filterRegex$,
  (graph, filterRegex) => {
    return {
      // If anything matches, drop it.
      nodes: graph.nodes.filter(
        node => !filterRegex.some(pattern => pattern.test(node.id))
      ),
      edges: graph.edges.filter(
        edge =>
          !filterRegex.some(
            pattern => pattern.test(edge.from) || pattern.test(edge.to)
          )
      )
    };
    // console.log(newGraph);
    // return newGraph;
  }
);

export const networkXGraph$ = createSelector(
  visNetworkGraph$,
  graph => {
    const digraph = new DiGraph();
    const networkXEdges = graph.edges.map(edge => [edge.from, edge.to]);
    digraph.addNodesFrom(graph.nodes.map(node => node.id));
    digraph.addEdgesFrom(networkXEdges);
    return digraph;
  }
);

export const enrichedGraph$ = createSelector(
  visNetworkGraph$,
  networkXGraph$,
  (visNetwork, networkX) => {
    return {
      edges: visNetwork.edges,
      nodes: visNetwork.nodes.map(node => ({
        ...node,
        inDegree: networkX.inDegree(node.id),
        outDegree: networkX.outDegree(node.id)
      }))
    };
  }
);

// Return object where key is authorName, and logs are the body
export const logsByAuthor$ = createSelector(
  gitLogs$,
  gitLogs => {
    // TODO: rewrite w/ transducer if this ends up being slow
    const baseDate = new Date();
    return pipe( map(pick([
          'authorName',
          'committerDate',
          'subject',
          'abbrevHash'
        ])),
      // Sat Feb 9 20:27:55 2019 -0800 // lazy form of ramda evolve
      // https://date-fns.org/v2.2.1/docs/parse
      map(log => ({
        ...log,
        committerDate: parse(
          log.committerDate,
          'EEE LLL dd HH:mm:ss yyyy xx',
          baseDate
        )
      })), groupBy(log => log.authorName) )(gitLogs);
  }
);

export default {
  dotGraph$,
  visNetworkGraph$,
  networkXGraph$,
  enrichedGraph$,
  logsByAuthor$
};
