import React, {PropTypes} from 'react';
import {FileSystem} from 'xdl';

import StyleConstants from '../StyleConstants';

import IconButton from './IconButton';
import MenuItem from './MenuItem';
import MenuSeparator from './MenuSeparator';

const POPOVERS = {
  PROJECT: 1,
  RESTART: 2,
  SEND_LINK: 3,
  USER: 4,
};

export default class ToolBar extends React.Component {
  static propTypes = {
    isProjectOpen: PropTypes.bool,
    openPopover: PropTypes.oneOf(Object.keys(POPOVERS).map((k) => POPOVERS[k])),
    onTogglePopover: PropTypes.func.isRequired,
    packagerController: PropTypes.object,
    projectName: PropTypes.string,
    userName: PropTypes.string,

    onNewProjectClick: PropTypes.func,
    onOpenProjectClick: PropTypes.func,
    onPublishClick: PropTypes.func,
    onRestartPackagerClick: PropTypes.func,
    onRestartAllClick: PropTypes.func,
  };

  _getTogglePopoverFn = (popover) => {
    return (event) => {
      event.stopPropagation();
      this.props.onTogglePopover(popover);
    };
  }

  _renderPopoverProject() {
    if (this.props.openPopover !== POPOVERS.PROJECT) {
      return null;
    }
    return (
      <div>
        <MenuItem label="New Project" shortcut="N"
          onClick={this.props.onNewProjectClick}
        />
        <MenuItem label="Open Project" shortcut="O"
          onClick={this.props.onOpenProjectClick}
        />
        <MenuSeparator />
        <MenuItem label="Show in Finder"
          isDisabled={!this.props.isProjectOpen}
          onClick={this._onShowInFinderClick}
        />
        <MenuItem label="Open in Terminal"
          isDisabled={!this.props.isProjectOpen}
          onClick={this._onOpenInTerminalClick}
        />
        <MenuItem label="Open in Editor"
          isDisabled={!this.props.isProjectOpen}
          onClick={this._onOpenInEditorClick}
        />
      </div>
    );
  }

  _renderPopoverRestart() {
    if (this.props.openPopover !== POPOVERS.RESTART) {
      return null;
    }
    return (
      <div>
        <MenuItem label="Restart packager" shortcut="O"
          onClick={this.props.onRestartPackagerClick}
        />
        <MenuItem label="Restart all"
          onClick={this.props.onRestartAllClick}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        <div style={Styles.row}>
          <div style={{...Styles.leftCol, ...Styles.projectName}}>
            Project Name goes here
          </div>
          <div style={{...Styles.rightCol, ...Styles.userName}}>
            {this.props.userName}
          </div>
        </div>
        <div style={Styles.separator} />
        <div style={Styles.row}>
          <div style={Styles.leftCol}>
            <IconButton iconUrl="./IconBolt.png" label="Project" color="#8309e0"
              onClick={this._getTogglePopoverFn(POPOVERS.PROJECT)}
              popover={this._renderPopoverProject()}
              style={Styles.rightSpaced}
            />
            <IconButton iconUrl="./IconArrowUp.png" label="Publish" color="#18B405"
              isDisabled={!this.props.isProjectOpen}
              onClick={this.props.onPublishClick}
              style={Styles.rightSpaced}
            />
            <IconButton iconUrl="./IconRestart.png" label="Restart" color="#328CE9"
              isDisabled={!this.props.isProjectOpen}
              onClick={this._getTogglePopoverFn(POPOVERS.RESTART)}
              popover={this._renderPopoverRestart()}
              style={Styles.rightSpaced}
            />
          </div>
          <div style={Styles.rightCol}>
            <IconButton iconUrl="./IconArrowRight.png" label="Send Link" color="#383D40"
              isDisabled={!this.props.isProjectOpen}
              onClick={this._getTogglePopoverFn(POPOVERS.SEND_LINK)}
              style={Styles.rightSpaced}
            />
            <IconButton iconUrl="./IconPhone.png" label="Simulator" color="#383D40"
              isDisabled={!this.props.isProjectOpen}
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
    );
  }

  _projectDir() {
    return this.props.packagerController.opts.absolutePath;
  }

  _onShowInFinderClick = () => {
    FileSystem.openFinderToFolderAsync(this._projectDir()).catch((err) => {
      console.error(err);
    });
  };

  _onOpenInTerminalClick = () => {
    FileSystem.openFolderInItermOrTerminalAsync(this._projectDir()).catch((err) => {
      console.error(err);
    });
  };

  _onOpenInEditorClick = () => {
    FileSystem.openProjectInEditorAsync(this._projectDir()).catch((err) => {
      console.error(err);
    });
  };
}

const Styles = {
  separator: {
    borderTop: `1px solid ${StyleConstants.colorBorder}`,
    margin: StyleConstants.gutterLg,
  },
  row: {
    margin: StyleConstants.gutterLg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    flex: 1,
    textAlign: 'right',
  },
  rightSpaced: {
    marginRight: StyleConstants.gutterLg,
  },
  projectName: {
    color: StyleConstants.colorText,
    fontSize: StyleConstants.fontSizeLg,
  },
  userName: {
    color: StyleConstants.colorSubtitle,
    fontSize: StyleConstants.fontSizeMd,
  },
};
