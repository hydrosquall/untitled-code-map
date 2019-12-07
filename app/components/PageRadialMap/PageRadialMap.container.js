import { connect } from 'react-redux';

// Redux machinery
import { filePath$, folderStructure$ } from '../../store/selectors/file-tree';
import { setFilePath , getFolderStructure } from '../../store/actions/file-tree';

import PageRadialMap from './PageRadialMap';

const mapStateToProps = state => ({
  filePath: filePath$(state),
  folderStructure: folderStructure$(state)
});
const mapDispatchToProps = {
  getFolderStructure,
  setFilePath
};

const PageRadialMapContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PageRadialMap);


export default PageRadialMapContainer;
