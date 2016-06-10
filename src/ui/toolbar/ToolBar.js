import Radium from 'radium';
import React, {PropTypes} from 'react';
import {
  Android,
  FileSystem,
  Simulator,
  UrlUtils,
  User,
} from 'xdl';

import StyleConstants from '../StyleConstants';

import IconButton from './IconButton';
import MenuItem from './MenuItem';
import MenuSeparator from './MenuSeparator';
import Popover from './Popover';

const POPOVERS = {
  PROJECT: 1,
  RESTART: 2,
  SEND_LINK: 3,
  SIMULATOR: 4,
  USER: 5,
};

@Radium
export default class ToolBar extends React.Component {
  static propTypes = {
    isProjectOpen: PropTypes.bool,
    openPopover: PropTypes.oneOf(Object.keys(POPOVERS).map((k) => POPOVERS[k])),
    onTogglePopover: PropTypes.func.isRequired,
    projectRoot: PropTypes.string,
    projectName: PropTypes.string,
    projectSettings: PropTypes.object,
    userName: PropTypes.string,

    onAppendErrors: PropTypes.func,
    onAppendLogs: PropTypes.func,
    onLogOut: PropTypes.func,
    onNewProjectClick: PropTypes.func,
    onOpenProjectClick: PropTypes.func,
    onPublishClick: PropTypes.func,
    onRestartPackagerClick: PropTypes.func,
    onRestartAllClick: PropTypes.func,
    onSendLinkClick: PropTypes.func,
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
      <div style={Styles.menu}>
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
      <div style={Styles.menu}>
        <MenuItem label="Restart packager" shortcut="O"
          onClick={this.props.onRestartPackagerClick}
        />
        <MenuItem label="Restart all"
          onClick={this.props.onRestartAllClick}
        />
      </div>
    );
  }

  _onSendLinkClick = (event) => {
    event.stopPropagation();
    if (this._sendLinkInput.value) {
      this.props.onSendLinkClick(this._sendLinkInput.value);
    }
  };

  _renderPopoverSendLink() {
    if (this.props.openPopover !== POPOVERS.SEND_LINK) {
      return null;
    }
    return (
      <div onClick={this._onSendLinkClick}>
        <input style={Styles.sendLinkInput}
          ref={(r) => {this._sendLinkInput = r;}}
          placeholder="Email or phone"
        />
        <a style={Styles.sendLinkSubmit}>Send Link</a>
      </div>
    );
  }

  _renderPopoverSimulator() {
    if (this.props.openPopover !== POPOVERS.SIMULATOR) {
      return null;
    }
    return (
      <div style={Styles.menu}>
        <MenuItem label="Exponent on iOS"
          onClick={this._simulatorIOSAsync}
        />
        <MenuItem label="Exponent on Android"
          onClick={this._simulatorAndroidAsync}
        />
      </div>
    );
  }

  _onLogOutClick = async () => {
    try {
      await User.logoutAsync();
      this.props.onLogOut();
    } catch (error) {
      console.error("logout error:", error);
    }
  };

  _renderUserName() {
    const popoverBodyEl = (
      <div style={Styles.menu}>
        <MenuItem label="Log out" onClick={this._onLogOutClick} />
      </div>
    );
    const userNameEl = (
      <a style={Styles.userName}
        onClick={this._getTogglePopoverFn(POPOVERS.USER)}>
        {this.props.userName}
      </a>
    );
    const userNameWithPopoverEl = (
      <Popover isToLeft body={popoverBodyEl}>{userNameEl}</Popover>
    );

    return this.props.openPopover === POPOVERS.USER ?
      userNameWithPopoverEl : userNameEl;
  }

  render() {
    return (
      <div>
        <div style={Styles.row}>
          <div style={{...Styles.leftCol, ...Styles.projectName}}>
            {this.props.projectName}
          </div>
          <div style={Styles.rightCol}>
            {this._renderUserName()}
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
              popover={this._renderPopoverSendLink()}
              isPopoverToLeft
              style={Styles.rightSpaced}
            />
            <IconButton iconUrl="./IconPhone.png" label="Simulator" color="#383D40"
              isDisabled={!this.props.isProjectOpen}
              onClick={this._getTogglePopoverFn(POPOVERS.SIMULATOR)}
              popover={this._renderPopoverSimulator()}
              isPopoverToLeft
            />
          </div>
        </div>
      </div>
    );
  }

  // File system methods

  _projectDir() {
    return this.props.projectRoot;
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

  // Simulator methods

  _simulatorIOSAsync = async () => {
    let projectUrl = await this._simulatorProjectUrlAsync();
    console.log("projectUrl=" + projectUrl);
    return await Simulator.openUrlInSimulatorSafeAsync(
      projectUrl, this.props.onAppendLogs, this.props.onAppendErrors);
  };

  _simulatorAndroidAsync = async () => {
    let projectUrl = await UrlUtils.constructManifestUrlAsync(
      this.props.projectRoot);
    console.log("projectUrl=" + projectUrl);
    return await Android.openUrlSafeAsync(
      projectUrl, this.props.onAppendLogs, this.props.onAppendErrors);
  };

  _simulatorProjectUrlAsync = async () => {
    return UrlUtils.constructManifestUrlAsync(this.props.projectRoot, {
      localhost: true,
      dev: this.props.projectSettings.dev,
      minify: this.props.projectSettings.minify,
    });
  };
}

const Styles = {
  separator: {
    borderTop: `1px solid ${StyleConstants.colorBorder}`,
    marginTop: StyleConstants.gutterLg,
    marginBottom: StyleConstants.gutterLg,
  },
  row: {
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
  menu: {
    marginTop: StyleConstants.gutterSm,
    marginBottom: StyleConstants.gutterSm,
  },
  projectName: {
    color: StyleConstants.colorText,
    fontSize: StyleConstants.fontSizeLg,
  },
  userName: {
    color: StyleConstants.colorSubtitle,
    cursor: 'pointer',
    fontSize: StyleConstants.fontSizeMd,
    textDecoration: 'none',
  },
  sendLinkInput: {
    border: 'none',
    color: StyleConstants.colorSubtitle,
    display: 'block',
    fontSize: StyleConstants.fontSizeMd,
    margin: StyleConstants.gutterSm,
    padding: StyleConstants.gutterSm,
    textAlign: 'center',
  },
  sendLinkSubmit: {
    cursor: 'pointer',
    display: 'block',
    borderTop: `1px solid ${StyleConstants.colorBorder}`,
    padding: StyleConstants.gutterMd,
    textAlign: 'center',
    textDecoration: 'none',

    backgroundColor: 'white',
    color: '#328CE9',
    ':active': {
      backgroundColor: StyleConstants.colorBackground,
      color: '#08509A',
    },
  },
  simulator: {
    textAlign: 'left',
  },
};
