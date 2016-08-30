import Radium from 'radium';
import React, {PropTypes} from 'react';
import {
  Analytics,
  Android,
  FileSystem,
  Simulator,
  UrlUtils,
} from 'xdl';

import {PopoverEnum} from '../Constants';
import ProjectIcon from '../ProjectIcon';
import StyleConstants from '../StyleConstants';

import IconButton from './IconButton';
import MenuItem from './MenuItem';
import MenuSeparator from './MenuSeparator';
import Popover from './Popover';

@Radium
export default class ToolBar extends React.Component {
  static propTypes = {
    isProjectOpen: PropTypes.bool,
    isProjectRunning: PropTypes.bool,
    openPopover: PropTypes.oneOf(Object.keys(PopoverEnum).map((k) => PopoverEnum[k])),
    onTogglePopover: PropTypes.func.isRequired,
    projectJson: PropTypes.object,
    projectRoot: PropTypes.string,
    projectSettings: PropTypes.object,
    sendTo: PropTypes.string,
    userName: PropTypes.string,

    onAppendErrors: PropTypes.func,
    onAppendLogs: PropTypes.func,
    onLogOut: PropTypes.func,
    onNewProjectClick: PropTypes.func,
    onOpenProjectClick: PropTypes.func,
    onCloseProjectClick: PropTypes.func,
    onPublishClick: PropTypes.func,
    onRestartClick: PropTypes.func,
    onSendLinkClick: PropTypes.func,
    onDocsClicked: PropTypes.func,
    onJoinUsOnSlackClicked: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      shiftSelected: false,
    };
  }

  componentDidMount() {
    document.body.addEventListener('keydown', this._onKeyDown);
    document.body.addEventListener('keyup', this._onKeyUp);
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this._onKeyDown);
    document.body.removeEventListener('keyup', this._onKeyUp);
  }

  _onKeyDown = (event) => {
    let metaKey = event.ctrlKey;
    if (process.platform === 'darwin') {
      metaKey = event.metaKey;
    }

    this.setState({
      shiftSelected: !!event.shiftKey,
    });

    if (metaKey) {
      switch (event.key.toLowerCase()) {
        case 'n':
          event.preventDefault();
          this.props.onNewProjectClick();
          break;
        case 'o':
          event.preventDefault();
          this.props.onOpenProjectClick();
          break;
        case 'p':
          event.preventDefault();
          if (this.props.isProjectOpen) {
            this.props.onRestartClick(!!event.shiftKey);
          }
          break;
        case 'i':
          event.preventDefault();
          if (this.props.isProjectRunning && Simulator.isPlatformSupported()) {
            this._simulatorIOSAsync();
          }
          break;
        case 'd':
          event.preventDefault();
          if (this.props.isProjectRunning && Android.isPlatformSupported()) {
            this._simulatorAndroidAsync();
          }
          break;
      }
    }
  };

  _onKeyUp = (event) => {
    this.setState({
      shiftSelected: !!event.shiftKey,
    });
  }

  _getTogglePopoverFn = (popover) => {
    return (event) => {
      event.stopPropagation();
      this.props.onTogglePopover(popover);
    };
  }

  _renderPopoverProject() {
    if (this.props.openPopover !== PopoverEnum.PROJECT) {
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
        <MenuItem label="Close Project"
          isDisabled={!this.props.isProjectOpen}
          onClick={this.props.onCloseProjectClick}
        />
        {this._renderOpenLinks()}
      </div>
    );
  }

  _renderOpenLinks() {
    if (process.platform === 'darwin' || process.platform === 'win32') {
      return (
        <div>
          <MenuSeparator />
          <MenuItem label={FileSystem.openFolderName()}
            isDisabled={!this.props.isProjectOpen}
            onClick={this._onShowInFinderClick}
          />
          <MenuItem label={FileSystem.openConsoleName()}
            isDisabled={!this.props.isProjectOpen}
            onClick={this._onOpenInTerminalClick}
          />
          {process.platform === 'darwin' ?
            <MenuItem label="Open in Editor"
              isDisabled={!this.props.isProjectOpen}
              onClick={this._onOpenInEditorClick}
            /> : null}
        </div>
      );
    } else {
      return null;
    }
  }

  _renderPopoverHelp() {
    if (this.props.openPopover !== PopoverEnum.HELP) {
      return null;
    }
    return (
      <div>
        <MenuItem label="Exponent Docs"
          onClick={this.props.onDocsClicked}
        />
        <MenuItem label="Join us on Slack"
          onClick={this.props.onJoinUsOnSlackClicked}
        />
      </div>
    );
  }

  _onSendLinkClick = (event) => {
    if (this._sendLinkInput.value) {
      this._getTogglePopoverFn(PopoverEnum.SEND_LINK)(event);
      this.props.onSendLinkClick(this._sendLinkInput.value);
    }
  };

  _onMenuClick = (event) => {
    event.stopPropagation();
  };

  _renderPopoverSendLink() {
    if (this.props.openPopover !== PopoverEnum.SEND_LINK) {
      return null;
    }
    return (
      <div onClick={this._onMenuClick}>
        <input style={Styles.sendLinkInput}
          ref={(r) => { this._sendLinkInput = r; }}
          defaultValue={this.props.sendTo}
          placeholder="Email or phone"
        />
        <a onClick={this._onSendLinkClick}
          style={Styles.sendLinkSubmit}>Send Link</a>
      </div>
    );
  }

  _renderPopoverSimulator() {
    if (this.props.openPopover !== PopoverEnum.DEVICE) {
      return null;
    }
    return (
      <div>
        {Simulator.isPlatformSupported() && (
          <MenuItem label="Open on iOS" shortcut="I"
            onClick={this._simulatorIOSAsync}
          />
        )}
        {Android.isPlatformSupported() && (
          <MenuItem label="Open on Android" shortcut="D"
            onClick={this._simulatorAndroidAsync}
          />
        )}
      </div>
    );
  }

  _onLogOutClick = async () => {
    try {
      this.props.onLogOut();
    } catch (error) {
      console.error("logout error:", error);
    }
  };

  _renderUserName() {
    const popoverBodyEl = (
      <div>
        <MenuItem label="Log out" onClick={this._onLogOutClick} />
      </div>
    );
    const userNameEl = (
      <a style={Styles.userName}
        onClick={this._getTogglePopoverFn(PopoverEnum.USER)}>
        {this.props.userName}
      </a>
    );
    const userNameWithPopoverEl = (
      <Popover arrowOffset={10} isToLeft body={popoverBodyEl}>
        {userNameEl}
      </Popover>
    );

    return this.props.openPopover === PopoverEnum.USER ?
      userNameWithPopoverEl : userNameEl;
  }

  render() {
    const iconUrl = this.props.projectJson && this.props.projectJson.icon;
    const projectName =
      (this.props.projectJson && this.props.projectJson.name) ||
      this.props.projectRoot;

    return (
      <div>
        <div style={Styles.row}>
          <div style={Styles.leftCol}>
            <ProjectIcon iconUrl={iconUrl} />
            <div style={Styles.projectName}>{projectName}</div>
          </div>
          <div style={Styles.rightCol}>
            {this._renderUserName()}
          </div>
        </div>
        <div style={Styles.separator} />
        <div style={Styles.row}>
          <div style={Styles.leftCol}>
            <IconButton
              iconUrl="./IconBolt.png"
              label="Project"
              color="#8309e0"
              onClick={this._getTogglePopoverFn(PopoverEnum.PROJECT)}
              popover={this._renderPopoverProject()}
              style={Styles.rightSpaced}
            />
            <IconButton
              iconUrl="./IconRestart.png"
              label="Restart"
              color="#328CE9"
              isDisabled={!this.props.isProjectOpen}
              onClick={this._restartClicked}
              style={Styles.rightSpaced}
            />
            <IconButton
              iconUrl="./IconHelp.png"
              label="Help"
              color="#383D40"
              onClick={this._getTogglePopoverFn(PopoverEnum.HELP)}
              popover={this._renderPopoverHelp()}
              style={Styles.rightSpaced}
            />
          </div>
          <div style={Styles.rightCol}>
            <IconButton
              iconUrl="./IconArrowUp.png"
              label="Publish"
              color="#18B405"
              isDisabled={!this.props.isProjectRunning}
              onClick={this.props.onPublishClick}
              style={Styles.rightSpaced}
            />
            <IconButton
              iconUrl="./IconArrowRight.png"
              label="Send Link"
              color="#383D40"
              isDisabled={!this.props.isProjectRunning}
              onClick={this._getTogglePopoverFn(PopoverEnum.SEND_LINK)}
              popover={this._renderPopoverSendLink()}
              isPopoverToLeft
              style={Styles.rightSpaced}
            />
            <IconButton
              iconUrl="./IconPhone.png"
              label="Device"
              color="#383D40"
              isDisabled={!this.props.isProjectRunning}
              onClick={this._getTogglePopoverFn(PopoverEnum.DEVICE)}
              popover={this._renderPopoverSimulator()}
              isPopoverToLeft
            />
          </div>
        </div>
      </div>
    );
  }

  _restartClicked = () => {
    this.props.onRestartClick(this.state.shiftSelected);
  }

  // File system methods

  _onShowInFinderClick = () => {
    Analytics.logEvent('Click Show in Finder');

    FileSystem.openFolderAsync(this.props.projectRoot).catch((err) => {
      console.error(err);
    });
  };

  _onOpenInTerminalClick = () => {
    Analytics.logEvent('Click Open in Terminal');

    FileSystem.openConsoleAsync(this.props.projectRoot).catch((err) => {
      console.error(err);
    });
  };

  _onOpenInEditorClick = () => {
    Analytics.logEvent('Click Open in Editor');

    FileSystem.openProjectInEditorAsync(this.props.projectRoot).catch((err) => {
      console.error(err);
    });
  };

  // Simulator methods

  _simulatorIOSAsync = async () => {
    let projectUrl = await this._simulatorProjectUrlAsync();
    console.log("projectUrl=" + projectUrl);
    return await Simulator.openUrlInSimulatorSafeAsync(projectUrl);
  };

  _simulatorAndroidAsync = async () => {
    return await Android.openProjectAsync(this.props.projectRoot);
  };

  _simulatorProjectUrlAsync = async () => {
    return UrlUtils.constructManifestUrlAsync(this.props.projectRoot, {
      hostType: 'localhost',
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
  projectName: {
    color: StyleConstants.colorText,
    display: 'inline-block',
    fontSize: StyleConstants.fontSizeLg,
    marginLeft: StyleConstants.gutterMd,
    verticalAlign: 'middle',
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
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: StyleConstants.gutterMd,
    padding: StyleConstants.gutterSm,
    textAlign: 'center',
  },
  sendLinkSubmit: {
    cursor: 'pointer',
    display: 'block',
    borderTop: `1px solid ${StyleConstants.colorBorder}`,
    paddingTop: StyleConstants.gutterMd,
    paddingRight: StyleConstants.gutterMd,
    paddingLeft: StyleConstants.gutterMd,
    textAlign: 'center',
    textDecoration: 'none',

    backgroundColor: 'white',
    color: '#328CE9',
    ':active': {
      backgroundColor: StyleConstants.colorBackground,
      color: '#08509A',
    },
  },
};
