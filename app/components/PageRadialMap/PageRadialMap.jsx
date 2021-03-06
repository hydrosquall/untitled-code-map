import React, { useCallback } from 'react';

import { remote } from 'electron';
import useDimensions from 'react-use-dimensions';

import { Navbar } from '../Navbar';
import RepositoryRadialMap from './RadialMap';

import DEFAULT_FOLDER_DATA from './facebook-react.json';

const { dialog } = remote; // Open file dialog

// Memoize if this gets slow
const PageRadialMap = props => {
  const { filePath, folderStructure, setFilePath, getFolderStructure } = props; // use same redux state as the sibling page, decouple this in the future.
  const handleOpenFileOrDirectory = useCallback(() => {
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then(payload => {
      const { canceled, filePaths } = payload;
      if (canceled) {
        return;
      }
      setFilePath(filePaths[0]); // for now, single-select.
    });
  }, [setFilePath]);

  const handleFetchTree = useCallback(() => {
    getFolderStructure(filePath);
  }, [filePath, getFolderStructure]);

  const appBarProps = {
    handleOpenFileClick: handleOpenFileOrDirectory,
    fetchTree: handleFetchTree,
    filePath
  };

  // TODO: dynamically get base URL path too. For now, default to facebook react.
  const folderData = folderStructure || DEFAULT_FOLDER_DATA;

  const [ref, { x, y, width }] = useDimensions();

  return (
    <div ref={ref}>
      <Navbar {...appBarProps}/>
      {width && <RepositoryRadialMap folderData={folderData} width={width} />}
    </div>
  );
};

export default PageRadialMap;
