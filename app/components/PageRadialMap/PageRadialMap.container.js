import { connect } from 'react-redux';

// Redux machinery
import { setFilePath } from '../../store/actions/file-tree';
import { filePath$, folderStructure$ } from '../../store/selectors/file-tree';
import { getFolderStructurePython } from '../../store/actions/file-tree';

import PageRadialMap from './PageRadialMap';

const mapStateToProps = state => ({
  filePath: filePath$(state),
  folderStructure: folderStructure$(state)
});
const mapDispatchToProps = {
  getFolderStructurePython,
  setFilePath
};

const PageRadialMapContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PageRadialMap);


export default PageRadialMapContainer;
