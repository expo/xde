/**
 * @flow
 */

import { StyleSheet, css } from 'aphrodite';
import React from 'react';
import { Analytics, Android, FileSystem, Simulator, XDLState } from 'xdl';
import _ from 'lodash';
import QRCode from 'qrcode.react';

import { actions } from 'xde/state';
import { connectToData } from 'xde/state/utils';

import { PopoverEnum } from '../Constants';
import ProjectIcon from '../ProjectIcon';
import SharedStyles from '../Styles';
import StyleConstants from '../StyleConstants';

import IconButton from './IconButton';
import MenuItem from './MenuItem';
import MenuSeparator from './MenuSeparator';
import Popover from './Popover';

import type { AppState, AppActions } from 'xde/state/types';

type Props = {
  url?: string,
  isProjectOpen: boolean,
  isProjectRunning: boolean,
  openPopover?: $Keys<typeof PopoverEnum>,
  onTogglePopover: () => void,
  projectJson?: {
    icon: string,
  },
  projectRoot?: string,
  projectSettings?: {
    dev: boolean,
    minify: boolean,
  },
  sendTo?: string,
  userName?: string,
  publishHistory?: Array<{
    channel: string,
  }>,

  onAppendErrors: () => void,
  onAppendLogs: () => void,
  onLogOut: () => void,
  onNewProjectClick: () => void,
  onOpenProjectClick: () => void,
  onCloseProjectClick: () => void,
  onPublishClick: () => void,
  onRestartClick: () => void,
  onSendLinkClick: () => void,
  onDocsClicked: () => void,
  onForumsClicked: () => void,
  onJoinUsOnSlackClicked: () => void,
  onChatWithUsOnIntercomClicked: () => void,
  onSendDiagnosticsReportClicked: () => void,
  onClearXDECacheClicked: () => void,

  actions: AppActions,
  notifications?: any,
};

type State = {
  shiftSelected: boolean,
  selectedChannelIndex: number,
  publishChannelOptions: Array<string>,
};

const mapStateToProps = (state, props) => {
  return {
    notifications: props.projectRoot ? state.notifications[props.projectRoot] : null,
  };
};

class ToolBar extends React.Component {
  static data = ({ auth }: AppState) => ({
    userName: auth.user && auth.user.nickname,
  });

  props: Props;
  state: State;
  _sendLinkInput: HTMLInputElement;
  _releaseChannelInput: HTMLInputElement;

  constructor(props, context) {
    super(props, context);
    this.state = {
      shiftSelected: false,
      selectedChannelIndex: 0,
      publishChannelOptions: ['default'],
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

  _onKeyDown = event => {
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

  _onKeyUp = event => {
    this.setState({
      shiftSelected: !!event.shiftKey,
    });
  };

  _getTogglePopoverFn = popover => {
    return event => {
      event.stopPropagation();
      this.props.onTogglePopover(popover);
    };
  };

  _renderPopoverProject() {
    if (this.props.openPopover !== PopoverEnum.PROJECT) {
      return null;
    }
    return (
      <div>
        <MenuItem label="New Project" shortcut="N" onClick={this.props.onNewProjectClick} />
        <MenuItem label="Open Project" shortcut="O" onClick={this.props.onOpenProjectClick} />
        <MenuItem
          label="Close Project"
          isDisabled={!this.props.isProjectOpen}
          onClick={this.props.onCloseProjectClick}
        />
        {this._renderNotificationsLink()}
        {this._renderOpenLinks()}
      </div>
    );
  }

  _renderNotificationsLink = () => {
    let { notifications } = this.props;

    if (!notifications || notifications.count === 0) {
      return null;
    }

    return (
      <MenuItem
        label="View Issues"
        onClick={this._onViewIssuesClicked}
        color={notifications.color}
      />
    );
  };

  _onViewIssuesClicked = () => {
    XDLState.store.dispatch(
      XDLState.actions.projects.selectNotificationsPane(this.props.projectRoot)
    );
  };

  _renderOpenLinks() {
    if (process.platform === 'darwin' || process.platform === 'win32') {
      return (
        <div>
          <MenuSeparator />
          <MenuItem
            label={FileSystem.openFolderName()}
            isDisabled={!this.props.isProjectOpen}
            onClick={this._onShowInFinderClick}
          />
          <MenuItem
            label={FileSystem.openConsoleName()}
            isDisabled={!this.props.isProjectOpen}
            onClick={this._onOpenInTerminalClick}
          />
          {process.platform === 'darwin' ? (
            <MenuItem
              label="Open in Editor"
              isDisabled={!this.props.isProjectOpen}
              onClick={this._onOpenInEditorClick}
            />
          ) : null}
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
        <MenuItem label="Expo Docs" onClick={this.props.onDocsClicked} />
        <MenuItem label="Expo Forums" onClick={this.props.onForumsClicked} />
        <MenuItem label="Clear XDE Cache" onClick={this.props.onClearXDECacheClicked} />
        <MenuItem label="Join Us On Slack" onClick={this.props.onJoinUsOnSlackClicked} />
        <MenuItem
          label="Send Diagnostics Report"
          isDisabled={!this.props.isProjectOpen}
          onClick={this.props.onSendDiagnosticsReportClicked}
        />
      </div>
    );
  }

  get releaseChannelOptions() {
    let recentChannels = _.map(this.props.publishHistory, result => result.channel);
    // The empty string is a placeholder for the input box
    return _.uniq(['default', ...recentChannels, ''])
  }

  _setSelectedChannel = event => {
    this.setState({
      selectedChannelIndex: parseInt(event.target.value),
    });
  };

  _maybePublish = event => {
    if (event.type === 'keypress' && event.key !== 'Enter') {
      return;
    }

    this._onPublishClick(event);
  };

  _onPublishClick = event => {
    let channelOptions = this.releaseChannelOptions
    let isInputBoxOption = this.state.selectedChannelIndex === (channelOptions.length - 1)
    let channel = isInputBoxOption ? this._releaseChannelInput.value : channelOptions[this.state.selectedChannelIndex]

    if (channel) {
      this._getTogglePopoverFn(PopoverEnum.Publish)(event);
      this.props.onPublishClick(channel);
      this.setState({selectedChannelIndex: 0})
    }
  };

  _renderPopoverPublish() {
    if (this.props.openPopover !== PopoverEnum.PUBLISH) {
      return null;
    }

    return (
      <div onClick={this._onMenuClick}>
        <div className={css(styles.publishHeader)}>Select Release Channel</div>
        {this._renderChannelOptions()}
        <a onClick={this._onPublishClick} className={css(styles.popoverSubmit)}>
          Publish
        </a>
      </div>
    );
  };

  _renderChannelOptions = () => {
    let channelOptions = this.releaseChannelOptions
    return channelOptions.map((option, index) => {
      let isInputBoxOption = index === channelOptions.length - 1

      return (<div key={option} className={css(styles.releaseChannelRow)}>
        <input type="radio"
          className={css(styles.releaseChannelRadio)}
          value={index}
          onChange={this._setSelectedChannel}
          checked={this.state.selectedChannelIndex === index} />
        {isInputBoxOption ?
          <input className={css(styles.popoverInput, styles.publishInput)}
            ref={r => {
              this._releaseChannelInput = r;
            }}
            onKeyPress={this._maybePublish}
            placeholder="Channel name" /> :
          <div className={css(styles.releaseChannelName)}>{option}</div>}
      </div>)
    })
  };

  _maybeSendLink = event => {
    if (event.type === 'keypress' && event.key !== 'Enter') {
      return;
    }

    this._onSendLinkClick(event);
  };

  _onSendLinkClick = event => {
    if (this._sendLinkInput.value) {
      this._getTogglePopoverFn(PopoverEnum.SHARE)(event);
      this.props.onSendLinkClick(this._sendLinkInput.value);
    }
  };

  _onMenuClick = event => {
    event.stopPropagation();
  };

  _renderPopoverShare() {
    if (this.props.openPopover !== PopoverEnum.SHARE) {
      return null;
    }
    return (
      <div onClick={this._onMenuClick}>
        <div className={css(styles.qrCode)}>
          <QRCode value={this.props.url} />
        </div>
        <div className={css(styles.shareOrDiv)}>- or -</div>
        <input
          className={css(styles.popoverInput, styles.sendLinkInput)}
          autoFocus
          ref={r => {
            this._sendLinkInput = r;
          }}
          onKeyPress={this._maybeSendLink}
          defaultValue={this.props.sendTo}
          placeholder="Email or phone"
        />
      <a onClick={this._onSendLinkClick} className={css(styles.popoverSubmit)}>
          Send Link
        </a>
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
          <MenuItem label="Open on iOS Simulator" shortcut="I" onClick={this._simulatorIOSAsync} />
        )}
        {Android.isPlatformSupported() && (
          <MenuItem label="Open on Android" shortcut="D" onClick={this._simulatorAndroidAsync} />
        )}
      </div>
    );
  }

  _onLogOutClick = async () => {
    try {
      // Logout!
      this.props.actions.auth.logout();
      // Tell the parent component
      this.props.onLogOut();
    } catch (error) {
      console.error('logout error:', error);
    }
  };

  _renderUserName() {
    const popoverBodyEl = (
      <div>
        <MenuItem label="Sign out" onClick={this._onLogOutClick} />
      </div>
    );
    const userNameEl = (
      <a className={css(styles.userName)} onClick={this._getTogglePopoverFn(PopoverEnum.USER)}>
        {this.props.userName}
      </a>
    );
    const userNameWithPopoverEl = (
      <Popover arrowOffset={10} isToLeft body={popoverBodyEl}>
        {userNameEl}
      </Popover>
    );

    return this.props.openPopover === PopoverEnum.USER ? userNameWithPopoverEl : userNameEl;
  }

  render() {
    const iconUrl = this.props.projectJson && this.props.projectJson.icon;
    const projectName =
      (this.props.projectJson && this.props.projectJson.name) || this.props.projectRoot;
    let { notifications } = this.props;
    let notificationsCount = null;
    let notificationsColor = null;

    if (notifications && notifications.count > 0) {
      notificationsCount = notifications.count;
      notificationsColor = notifications.color;
    }

    return (
      <div>
        <div className={css(styles.row)}>
          <div className={css(styles.leftCol)}>
            {iconUrl && <ProjectIcon iconUrl={iconUrl} />}
            <div className={css(styles.projectName)}>{projectName}</div>
          </div>
          <div className={css(styles.rightCol, styles.username)}>{this._renderUserName()}</div>
        </div>
        <div className={css(styles.separator)} />
        <div className={css(styles.row)}>
          <div className={css(styles.leftCol)}>
            <IconButton
              iconUrl="./IconBolt.png"
              label="Project"
              color="#8309e0"
              onClick={this._getTogglePopoverFn(PopoverEnum.PROJECT)}
              popover={this._renderPopoverProject()}
              styles={styles.rightSpaced}
              badgeCount={notificationsCount}
              badgeBackgroundColor={notificationsColor}
            />
            <IconButton
              iconUrl="./IconRestart.png"
              label="Restart"
              color="#328CE9"
              isDisabled={!this.props.isProjectOpen}
              onClick={this._restartClicked}
              styles={styles.rightSpaced}
            />
            <IconButton
              iconUrl="./IconHelp.png"
              label="Help"
              color="#383D40"
              onClick={this._getTogglePopoverFn(PopoverEnum.HELP)}
              popover={this._renderPopoverHelp()}
              styles={styles.rightSpaced}
            />
          </div>
          <div className={css(styles.rightCol)}>
            <IconButton
              iconUrl="./IconArrowUp.png"
              label="Publish"
              color="#18B405"
              isDisabled={!this.props.isProjectRunning}
              onClick={this._getTogglePopoverFn(PopoverEnum.PUBLISH)}
              popover={this._renderPopoverPublish()}
              styles={styles.rightSpaced}
            />
            <IconButton
              iconUrl="./IconArrowRight.png"
              label="Share"
              color="#383D40"
              isDisabled={!this.props.isProjectRunning}
              onClick={this._getTogglePopoverFn(PopoverEnum.SHARE)}
              popover={this._renderPopoverShare()}
              isPopoverToLeft
              styles={styles.rightSpaced}
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
  };

  // File system methods

  _onShowInFinderClick = () => {
    Analytics.logEvent('Click Show in Finder');

    FileSystem.openFolderAsync(this.props.projectRoot).catch(err => {
      console.error(err);
    });
  };

  _onOpenInTerminalClick = () => {
    Analytics.logEvent('Click Open in Terminal');

    FileSystem.openConsoleAsync(this.props.projectRoot).catch(err => {
      console.error(err);
    });
  };

  _onOpenInEditorClick = () => {
    Analytics.logEvent('Click Open in Editor');

    FileSystem.openProjectInEditorAsync(this.props.projectRoot).catch(err => {
      console.error(err);
    });
  };

  // Simulator methods

  _simulatorIOSAsync = async () => {
    return await Simulator.openProjectAsync(this.props.projectRoot);
  };

  _simulatorAndroidAsync = async () => {
    return await Android.openProjectAsync(this.props.projectRoot);
  };
}

export default XDLState.connect(mapStateToProps)(connectToData(actions)(ToolBar));

const styles = StyleSheet.create({
  separator: {
    borderTop: `1px solid ${StyleConstants.colorBorder}`,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: StyleConstants.gutterLg,
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    flex: 1,
    textAlign: 'right',
  },
  username: {
    height: 25,
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
  publishHeader: {
    color: StyleConstants.colorText,
    fontSize: StyleConstants.fontSizeMd,
    fontWeight: 'bold',
    padding: StyleConstants.gutterMd,
  },
  releaseChannelRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: StyleConstants.gutterMd,
    paddingRight: StyleConstants.gutterMd,
    paddingTop: StyleConstants.gutterSm,
    paddingBottom: StyleConstants.gutterSm,
  },
  releaseChannelRadio: {
    margin: 0,
  },
  releaseChannelName: {
    cursor: 'default',
    color: StyleConstants.colorText,
    fontSize: StyleConstants.fontSizeMd,
    marginLeft: StyleConstants.gutterMd,
  },
  qrCode: {
    marginTop: StyleConstants.gutterLg,
  },
  shareOrDiv: {
    color: StyleConstants.colorSubtitle,
    fontSize: StyleConstants.fontSizeSm,
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: StyleConstants.gutterMd,
  },
  popoverInput: {
    ...SharedStyles.input,
    color: StyleConstants.colorSubtitle,
    display: 'block',
    fontSize: StyleConstants.fontSizeMd,
    marginBottom: StyleConstants.gutterMd,
    padding: StyleConstants.gutterSm,
  },
  publishInput: {
    textAlign: 'left',
    marginLeft: StyleConstants.gutterMd,
    marginRight: StyleConstants.gutterMd,
    marginBottom: 0,
  },
  sendLinkInput: {
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  popoverSubmit: {
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
});
