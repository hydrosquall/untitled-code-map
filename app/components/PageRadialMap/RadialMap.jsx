// Initial import of Amelia's Code
// https://github.com/Wattenberger/Wattenberger-2019/blob/cc6773095e17a09dc04d98bd136f38f3933786be/src/components/Articles/ReactRepo/ReactRepo.jsx

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { tree as d3tree, hierarchy } from 'd3-hierarchy';
import { linkRadial } from 'd3-shape';
import { format } from 'd3-format';
import { timeFormat, timeParse } from 'd3-time-format';
import { scaleSqrt, scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { flatMapDeep, fromPairs } from 'lodash';

import { useSelector } from 'react-redux';

import { UncontrolledReactSVGPanZoom } from 'react-svg-pan-zoom';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import { getPointFromAngleAndDistance } from './utils';

import { remoteUrl$ } from '../../store/selectors/file-tree';

import styles from './page-radial-map.scss';

const repoTreeBaseUrl = 'https://github.com/facebook/react/blob/master';
const flattenArray = item => [item, flatMapDeep(item.children, flattenArray)];

const formatDate = timeFormat('%-m/%-d/%Y');
const sizeExtent = [3, 10000];
const sizeScale = scaleSqrt()
  .domain(sizeExtent)
  .range([1, 16])
  .clamp(true);

const colors = [
  '#c7ecee',
  '#778beb',
  '#f7d794',
  '#63cdda',
  '#cf6a87',
  '#e77f67',
  '#786fa6',
  '#FDA7DF',
  '#4b7bec',
  '#778ca3',
  // new colors
  '#cccccc', // yaml
  '#03dac6', // material turquoise - python
  '#3700b3' // purple - ipynb
];
const fileTypes = [
  'css',
  'html',
  'js',
  'json',
  'md',
  'png',
  'snap',
  'svg',
  'ico',
  'ts',
  'yml',
  // new colors for... RST, ipynb, whatever other files encountered in the wild...
  // in the future let users define their own mappings?
  'py',
  'ipynb'
];
const fileTypeColorsMap = fromPairs([
  ...fileTypes.map((type, i) => [type, colors[i]])
  // ["folder", "#000"]
]);

const lastEditAccessor = d => new Date(d.last_edit);
const parseDate = timeParse('%m/%d/%Y');
const colorScaleLastEdit = scaleLinear()
  // .domain(d3.extent(allNodes, lastEditAccessor))
  .domain([parseDate('01/01/2018'), parseDate('10/31/2019')]) // hardcoded dates, set this dynamically later.
  .range(['#9980FA', '#F79F1F']);
const colorScaleSize = scaleLinear()
  // .domain(d3.extent(allNodes, d => d.size))
  .domain([3, 100000]) // TODO: make this dynamic based on passed in data, and specific to the selected metric.
  .range(['#f2f2f7', '#5758BB']);

const useWithColorAccessorMap = data =>
  // Calculate before first render
  useState(() => {
    const allNodesForColor = flatMapDeep(data.children, flattenArray);
    const colorScaleNumOfEdits = scaleLinear()
      .domain(extent(allNodesForColor, d => d.num_of_edits))
      .range(['#f2f2f7', '#5758BB']);
    const colorAccessorMap = {
      type: d => fileTypeColorsMap[d.type],
      size: d => colorScaleSize(d.size),
      numOfEdits: d => colorScaleNumOfEdits(d.num_of_edits),
      lastEdit: d => colorScaleLastEdit(lastEditAccessor(d))
    };
    return colorAccessorMap;
  });
const DEFAULT_WIDTH = 500; // pixels
const RepositoryRadialMap = ({ folderData, width }) => {
  const [hoveringNode, setHoveringNode] = useState(null);
  const isClearingHover = useRef();
  const [radius, setRadius] = useState(Math.round(width / 2));
  const [colorMetric, setColorMetric] = useState('type');

  const [colorAccessorMap, _] = useWithColorAccessorMap(folderData);

  // Assume this is cheap to regenerate for now
  const colorMetricOptions = Object.keys(colorAccessorMap).map(metric => ({
    id: metric,
    label: metric
  }));

  const { tree, links, positions } = useMemo(() => {
    const tree = d3tree()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)(
      hierarchy(folderData)
    );

    const allNodes = flatMapDeep({ children: tree }, flattenArray);
    const positions = fromPairs(
      allNodes.map(({ x, y, data }) => [data.id, { x, y }])
    );

    const links = tree.links().map(link =>
      linkRadial()
        .angle(d => d.x)
        .radius(d => d.y)(link)
    );

    return {
      tree,
      links,
      positions
    };
  }, [radius, folderData]);

  const onUpdateHover = useCallback(
    (node = null) => {
      isClearingHover.current = false;
      setHoveringNode(node);
    },
    [setHoveringNode]
  );
  const onClearHover = useCallback(() => {
    isClearingHover.current = true;
    setTimeout(() => {
      if (!isClearingHover.current) return;
      setHoveringNode(null);
      isClearingHover.current = false;
    }, 500);
  }, [setHoveringNode]);

  const onPickColorMetric = useCallback(
    (event, value) => {
      setColorMetric(value);
    },
    [setColorMetric]
  );

  const BLOCK = 'RepositoryMap';
  return (
    <div className={styles.RepositoryMap}>
      <div className={styles[`${BLOCK}__actions`]}>
        <div className={styles[`${BLOCK}__actions__item`]}>
          <h6>color scale</h6>
          <ToggleButtonGroup
            size="small"
            value={colorMetric}
            exclusive
            onChange={onPickColorMetric}
            className={styles[`${BLOCK}__toggle`]}
          >
            {colorMetricOptions.map(option => (
              <ToggleButton key={option.id} value={option.id}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
        <div className={styles[`${BLOCK}__actions__item`]}>
          <h6>zoom</h6>
          <ButtonGroup>
            {[
              { value: 250, label: '+' },
              { value: -250, label: '-' }
            ].map(option => (
              <Button onClick={() => setRadius(radius + option.value)}>
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>
      <div className={styles[`${BLOCK}__chart`]}>
        <UncontrolledReactSVGPanZoom height={width} width={width - 300}>
          <svg
            className={styles[`${BLOCK}__svg`]}
            viewBox={[0, 0, radius * 2, radius * 2].join(' ')}
            height={width}
            width={width}
          >
            <defs>
              <Folder />
            </defs>
            <g transform={`translate(${radius}, ${radius})`}>
              {links && links.map((d, i) => <NodeLink key={i} d={d} />)}
              {tree && (
                <Node
                  {...tree}
                  {...{ onUpdateHover, colorMetric }}
                  colorAccessorMap={colorAccessorMap} // todo: move into react context to avoid prop drill.
                  onMouseLeave={onClearHover}
                />
              )}
            </g>
          </svg>
        </UncontrolledReactSVGPanZoom>
        {hoveringNode && (
          <NodeTooltip
            {...hoveringNode}
            position={positions[hoveringNode.data.id]}
            {...{ radius }}
          />
        )}
      </div>
    </div>
  );
};

export default RepositoryRadialMap;

const Node = React.memo(
  ({
    colorMetric,
    onUpdateHover,
    onMouseLeave,
    colorAccessorMap,
    ...nodeProps
  }) => {
    const { x, y, data, children } = nodeProps;

    if (children) {
      children.forEach(child => {
      if (child.data.id === undefined) {
        console.log({ child: child.data })
      }
    })
    }

    const baseUrl = useSelector(remoteUrl$);

    const onMouseEnter = useCallback(() => {
      onUpdateHover(nodeProps);
    }, []);
    const onClick = useCallback(() => {
      const url = `${baseUrl}${data.path}`;
      // const url = `${repoTreeBaseUrl}${data.path}`;
      console.log(url);
      const win = window.open(url, '_blank');
      win.focus();
    }, []);

    const handlers = useMemo(
      () => ({ colorMetric, onUpdateHover, onMouseLeave }),
      [colorMetric, onUpdateHover, onMouseLeave]
    );

    return (
      <>
        <g
          className={styles.Node}
          transform={[
            `rotate(${(x * 180) / Math.PI - 90})`,
            `translate(${y}, 0)`
          ].join(' ')}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
        >
          {data.type == 'folder' ? (
            <use className={styles.Node__folder} href="#Folder" />
          ) : (
            <circle
              className={styles.Node__circle}
              r={sizeScale(data.size)}
              style={{
                fill: colorAccessorMap[colorMetric](nodeProps.data)
              }}
            />
          )}
        </g>
        {children &&
          children.map((node, i) => (
            <Node
              key={`${node.data.id}`}
              colorAccessorMap={colorAccessorMap}
              {...node}
              {...handlers}
            />
          ))}
      </>
    );
  }
);
const NodeLink = React.memo(({ d }) => (
  <path className={styles.NodeLink} d={d} />
));

// Custom path def
const Folder = () => (
  <path
    className={styles.Folder}
    id="Folder"
    d="M8.68182 1.9091C8.68182 1.5836 8.55252 1.27144 8.32236 1.04128C8.09221 0.811126 7.78004 0.681824 7.45455 0.681824L1.72728 0.681824C1.40178 0.681824 1.08962 0.811125 0.859465 1.04128C0.629306 1.27144 0.500005 1.5836 0.500005 1.9091L0.500005 8.45455C0.500005 8.78004 0.629306 9.09221 0.859464 9.32236C1.08962 9.55252 1.40178 9.68182 1.72728 9.68182L6.22728 9.68182C6.55277 9.68182 6.86493 9.55252 7.09509 9.32236C7.32525 9.09221 7.45455 8.78004 7.45455 8.45455L7.45455 4.99167L8.49966 4.29494C8.61346 4.21906 8.68182 4.09133 8.68182 3.95455L8.68182 1.9091Z"
  />
);
const formatBytes = format(',.1f');

const NodeTooltip = ({ data, position, radius }) => {
  const rotatedPos = getPointFromAngleAndDistance(
    (position.x * 180) / Math.PI - 90,
    position.y
  );

  const BLOCK = 'NodeTooltip';
  return (
    <div
      className={styles[BLOCK]}
      style={{
        transform: `translate(calc(${rotatedPos.x +
          radius}px - 50%), ${rotatedPos.y + radius}px)`
      }}
    >
      <div className={styles[`${BLOCK}__name`]}>{data.name}</div>
      <div className={styles[`${BLOCK}__type`]}>
        <span>type</span> <span>{data.type}</span>
      </div>
      <div className={styles[`${BLOCK}__size`]}>
        <span>size</span> <span>{formatBytes(data.size / 1000)}KB</span>
      </div>
      {!!data.num_of_edits && (
        <div className={styles[`${BLOCK}__size`]}>
          <span>
            {data.num_of_edits} edit{data.num_of_edits != 1 && 's'}
          </span>{' '}
          <span>{formatDate(new Date(data.last_edit))}</span>
        </div>
      )}
      <div className={styles[`${BLOCK}__repo`]}>{data.path}</div>
      <div className={styles[`${BLOCK}__note`]}>
        Click to see the file on Github
      </div>
    </div>
  );
};
