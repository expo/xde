import { Api, Exp, Logger, NotificationCode, UserSettings, MessageCode } from 'xdl';

import _ from 'lodash';
import os from 'os';
import path from 'path';
import React, { PropTypes } from 'react';
import LoadingIndicator from 'react-loading-indicator';

import Commands from './Commands';
import StyleConstants from './StyleConstants';
import SharedStyles from './Styles';
import * as IdentifierRules from 'xde/utils/IdentifierRules';

const ICON_SIZE = 120;
const MAX_PROJECT_LENGTH = 44;
const HALF_MAX_PROJECT_LENGTH = 20;

class NewProjectModal extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isLoading: true,
      projectName: 'my-new-project',
      projectDirectory: null,
      errorMessage: null,
      loadingMessage: null,
      notificationType: null,
      showRetryPrompt: false,
      progress: null,
      templates: null,
      selectedTemplate: null,
    };
  }

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onSelectProject: PropTypes.func.isRequired,
  };

  _currentRequestID = 0;

  componentDidMount() {
    Logger.notifications.addStream({
      stream: {
        write: chunk => {
          switch (chunk.code) {
            case NotificationCode.PROGRESS:
              this.setState({
                loadingMessage: chunk.msg,
                notificationType: NotificationCode.PROGRESS,
              });
              break;
            case NotificationCode.DOWNLOAD:
              this.setState({
                loadingMessage: 'Downloading... ' + chunk.msg + '%',
                progress: chunk.msg,
                notificationType: NotificationCode.DOWNLOAD,
              });
              break;
            case NotificationCode.RETRY_DOWNLOAD:
              this.setState({
                showRetryPrompt: true,
              });
              break;
          }
        },
      },
      type: 'raw',
    });

    this._loadTemplatesAsync();
  }

  _loadTemplatesAsync = async () => {
    let versions = await Api.versionsAsync();
    let dir = await UserSettings.getAsync('defaultNewProjectDir', os.homedir());

    this.setState({
      isLoading: false,
      templates: versions.templatesv2,
      selectedTemplate: versions.templatesv2[0],
      projectDirectory: dir,
    });
  };

  render() {
    return (
      <div style={Styles.container}>
        {this.state.isLoading ? this._renderLoading() : this._renderForm()}
      </div>
    );
  }

  _selectTemplate = template => {
    this.setState({
      selectedTemplate: template,
    });
  };

  _renderTemplate = template => {
    let isSelected = this.state.selectedTemplate.id === template.id;

    return (
      <div
        key={template.id}
        style={{
          ...Styles.templateContainer,
          background: isSelected
            ? StyleConstants.colorPrimary
            : StyleConstants.colorLightBackground,
        }}
        onClick={() => this._selectTemplate(template)}>
        <img src={template.iconUrl} style={Styles.icon} />
        <div
          style={{
            ...Styles.mediumText,
            color: isSelected ? 'white' : StyleConstants.colorText,
          }}>
          {template.name}
        </div>
      </div>
    );
  };

  _renderForm = () => {
    let { templates, selectedTemplate } = this.state;

    if (!templates) {
      return <div />;
    }

    return (
      <form name="newProject" style={Styles.form} onSubmit={this._onSubmitNewProject}>
        <div style={Styles.largeText}>Choose a template for your project</div>
        <div style={Styles.templatesContainer}>
          <div style={{ minWidth: 'min-content', display: 'flex' }}>
            {_.map(templates, this._renderTemplate)}
          </div>
        </div>
        <div style={Styles.mediumText}>{selectedTemplate.description}</div>

        <div
          style={{
            ...Styles.largeText,
            marginTop: StyleConstants.gutterLg,
            marginBottom: StyleConstants.gutterMd,
          }}>
          Choose a project name and directory
        </div>
        <input
          autoFocus
          type="text"
          className="form-control"
          style={Styles.input}
          ref="projectName"
          onChange={this._onProjectNameChange}
          value={this.state.projectName}
        />
        <div className="input-group" style={Styles.input}>
          <input
            disabled
            type="text"
            className="form-control"
            style={{ color: StyleConstants.colorSubtitle }}
            ref="projectDirectory"
            value={this._getShortProjectDirectory()}
          />
          <span
            className="input-group-addon"
            style={{ cursor: 'pointer', background: 'white' }}
            onClick={this._onClickChangeProjectDirectoryAsync}>
            ...
          </span>
        </div>
        {this._renderErrors()}
        <div style={Styles.buttonsContainer}>
          <button onClick={this._onClickCancel} type="button" style={Styles.cancelButton}>
            <div key="button-text" style={{ flex: 1 }}>
              Cancel
            </div>
          </button>
          <button type="submit" style={Styles.submitButton}>
            <div key="button-text" style={{ flex: 1 }}>
              Create
            </div>
          </button>
        </div>
      </form>
    );
  };

  _renderErrors = () => {
    if (this.state.errorMessage) {
      return <div style={SharedStyles.errorMessage}>{this.state.errorMessage}</div>;
    } else {
      return null;
    }
  };

  _renderLoading = () => {
    let downloading = this.state.notificationType === NotificationCode.DOWNLOAD;
    return (
      <div style={Styles.loadingContainer}>
        {downloading ? (
          <div style={Styles.progressBar}>
            <div style={{ ...Styles.progress, width: this.state.progress * 2 }} />
          </div>
        ) : (
          <LoadingIndicator
            color={{
              red: 17,
              green: 114,
              blue: 182,
              alpha: 1.0,
            }}
            segmentWidth={6}
            segmentLength={15}
            spacing={9}
          />
        )}
        {this.state.loadingMessage && (
          <div style={Styles.loadingText}>{this.state.loadingMessage}</div>
        )}
        {this.state.showRetryPrompt ? (
          <div style={Styles.loadingContainer}>
            <div style={{ ...Styles.loadingText, paddingTop: 0 }}>
              {MessageCode.DOWNLOAD_IS_SLOW}
            </div>
            <button onClick={this._onClickRetry} type="button" style={Styles.retryButton}>
              <div key="button-text" style={{ flex: 1 }}>
                Retry
              </div>
            </button>
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  };

  _onProjectNameChange = event => {
    let newValue = IdentifierRules.normalizeProjectNameWhileTyping(event.target.value);
    let errorMessage = null;
    if (newValue.length === 0) {
      errorMessage = 'Project name cannot be blank';
    }

    this.setState({
      projectName: newValue,
      errorMessage,
    });
  };

  _getShortProjectDirectory = () => {
    let { projectName, projectDirectory } = this.state;
    let dir = path.join(projectDirectory, projectName);
    if (dir.length < MAX_PROJECT_LENGTH) {
      return dir;
    } else {
      return `${dir.substr(0, HALF_MAX_PROJECT_LENGTH)}...${dir.substr(
        dir.length - HALF_MAX_PROJECT_LENGTH
      )}`;
    }
  };

  _onClickChangeProjectDirectoryAsync = async () => {
    try {
      let directory = await Commands.getDirectoryAsync(this.state.projectDirectory);
      if (!directory) {
        return;
      }

      await UserSettings.setAsync('defaultNewProjectDir', directory);
      this.setState({
        projectDirectory: directory,
      });
    } catch (e) {}
  };

  _onClickCancel = event => {
    event.preventDefault();
    this.props.onClose();
  };

  _onClickRetry = async event => {
    Exp.clearXDLCacheAsync();
    this.setState({ showRetryPrompt: false });
    this._onSubmitNewProject(event);
  };

  _onSubmitNewProject = async event => {
    event.preventDefault();
    const requestID = this._currentRequestID + 1;
    this._currentRequestID = requestID;

    if (this.state.projectName.length === 0) {
      this.setState({
        errorMessage: 'Project name cannot be blank',
      });
      return;
    } else {
      this.setState({
        errorMessage: null,
        loadingMessage: null,
        isLoading: true,
      });
    }

    try {
      let templateDownload = await Exp.downloadTemplateApp(
        this.state.selectedTemplate.id,
        this.state.projectDirectory,
        {
          name: this.state.projectName,
          progressFunction: progress => {
            if (this._currentRequestID === requestID) {
              Logger.notifications.info(
                { code: NotificationCode.DOWNLOAD },
                Math.round(progress * 100)
              );
            }
          },
          retryFunction: () =>
            Logger.notifications.info(
              { code: NotificationCode.RETRY_DOWNLOAD },
              MessageCode.DOWNLOAD_IS_SLOW
            ),
        }
      );

      if (this._currentRequestID !== requestID) {
        return;
      }

      let projectRoot = await Exp.extractTemplateApp(
        templateDownload.starterAppPath,
        templateDownload.name,
        templateDownload.root
      );
      if (!projectRoot) {
        this.setState({
          isLoading: false,
        });
        return;
      }

      await this.props.onSelectProject(projectRoot);
      this.props.onClose();
    } catch (e) {
      Exp.clearXDLCacheAsync();
      this.setState({
        isLoading: false,
        errorMessage: e.message,
      });
    }
  };
}

let Styles = {
  container: {
    fontFamily: 'Verdana',
    padding: StyleConstants.gutterLg,
    overflowWrap: 'break-word',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    padding: StyleConstants.gutterLg,
    minWidth: 250,

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    width: 400,
    display: 'flex',
    flexDirection: 'column',
  },
  templatesContainer: {
    display: 'flex',
    flexDirection: 'row',
    //alignItems: 'center',
    //justifyContent: 'center',
    marginTop: 5,
    marginBottom: 10,
    overflowX: 'auto',
    backgroundColor: '#f1f1f1',
    borderRadius: 3,
    paddingTop: 5,
    paddingBottom: 5,
  },
  templateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: StyleConstants.gutterMd * 2,
    paddingBottom: StyleConstants.gutterMd,
    borderRadius: 4,
    cursor: 'pointer',
  },
  largeText: {
    fontWeight: 'bold',
    color: StyleConstants.colorText,
    fontSize: StyleConstants.fontSizeLg,
    paddingBottom: StyleConstants.gutterSm,
  },
  mediumText: {
    color: StyleConstants.colorSubtitle,
    fontSize: StyleConstants.fontSizeMd,
  },
  loadingText: {
    paddingTop: StyleConstants.gutterLg,
    color: StyleConstants.colorText,
    fontSize: StyleConstants.fontSizeMd,
  },
  buttonsContainer: {
    marginTop: 10,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    border: 'none',
    borderRadius: 5,
    color: 'black',
    padding: StyleConstants.gutterSm,
    width: '40%',

    backgroundColor: StyleConstants.colorCancel,
  },
  submitButton: {
    border: 'none',
    borderRadius: 5,
    color: 'white',
    padding: StyleConstants.gutterSm,
    width: '40%',

    backgroundColor: StyleConstants.colorPrimary,
  },
  retryButton: {
    border: 'none',
    borderRadius: 5,
    color: 'white',
    padding: StyleConstants.gutterSm,
    marginTop: 20,
    width: '40%',
    backgroundColor: StyleConstants.colorPrimary,
  },
  input: {
    marginBottom: StyleConstants.gutterMd,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginBottom: StyleConstants.gutterMd,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
  },
  progress: {
    backgroundColor: StyleConstants.colorPrimary,
    height: 30,
  },
  progressBar: {
    backgroundColor: StyleConstants.colorLightBackground,
    height: 30,
    width: 200,
  },
};

export default NewProjectModal;
