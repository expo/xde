import {
  Api,
  Exp,
  Logger,
  NotificationCode,
  UserSettings,
} from 'xdl';

import _ from 'lodash';
import os from 'os';
import React, { PropTypes } from 'react';
import LoadingIndicator from 'react-loading-indicator';

import Commands from './Commands';
import StyleConstants from './StyleConstants';
import SharedStyles from './Styles';
import * as IdentifierRules from '../IdentifierRules';

const ICON_SIZE = 120;

class NewProjectModal extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      isLoading: true,
      projectName: 'my-new-project',
      projectDirectory: null,
      errorMessage: null,
      loadingMessage: null,
      templates: null,
      selectedTemplate: null,
    };
  }

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onSelectProject: PropTypes.func.isRequired,
  }

  componentDidMount() {
    Logger.notifications.addStream({
      stream: {
        write: (chunk) => {
          switch (chunk.code) {
            case NotificationCode.PROGRESS:
              this.setState({
                loadingMessage: chunk.msg,
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
      templates: versions.templates,
      selectedTemplate: versions.templates[0],
      projectDirectory: dir,
    });
  }

  render() {
    return (
      <div style={Styles.container}>
        {this.state.isLoading ? this._renderLoading() : this._renderForm()}
      </div>
    );
  }

  _selectTemplate = (template) => {
    this.setState({
      selectedTemplate: template,
    });
  }

  _renderTemplate = (template) => {
    let isSelected = this.state.selectedTemplate.id === template.id;

    return (
      <div
        key={template.id}
        style={{...Styles.templateContainer,
          background: isSelected ? StyleConstants.colorPrimary : StyleConstants.colorLightBackground,
        }}
        onClick={() => this._selectTemplate(template)}>
        <img src={template.iconUrl} style={Styles.icon} />
        <div style={{...Styles.mediumText, color: isSelected ? 'white' : StyleConstants.colorText}}>
          {template.name}
        </div>
      </div>
    );
  }

  _renderForm = () => {
    let { templates, selectedTemplate } = this.state;

    if (!templates) {
      return (
        <div />
      );
    }

    return (
      <form name="newProject"
        style={Styles.form}
        onSubmit={this._onSubmitNewProject}>
        <div style={Styles.largeText}>
          Choose a template for your project:
        </div>
        <div style={Styles.templatesContainer}>
          <div style={{minWidth: 'min-content', display:'flex'}}>
            {_.map(templates, this._renderTemplate)}
          </div>
        </div>
        <div style={Styles.mediumText}>
          {selectedTemplate.description}
        </div>

        <div style={{...Styles.largeText, marginTop: StyleConstants.gutterLg, marginBottom: StyleConstants.gutterMd}}>
          Choose a project name and directory:
        </div>
        <input autoFocus type="text" className="form-control" style={Styles.input} ref="projectName"
          onChange={this._onProjectNameChange}
          value={this.state.projectName}
        />
        <div className="input-group" style={Styles.input}>
          <input disabled type="text" className="form-control" style={{color: StyleConstants.colorSubtitle}} ref="projectDirectory"
            value={this._getShortProjectDirectory()}
          />
          <span className="input-group-addon" style={{cursor: 'pointer', background: 'white'}} onClick={this._onClickChangeProjectDirectoryAsync}>...</span>
        </div>
        {this._renderErrors()}
        <div style={Styles.buttonsContainer}>
          <button onClick={this._onClickCancel}
            type="button"
            style={Styles.cancelButton}>
            <div key="button-text" style={{flex: 1}}>Cancel</div>
          </button>
          <button type="submit"
            style={Styles.submitButton}>
            <div key="button-text" style={{flex: 1}}>Create</div>
          </button>
        </div>
      </form>
    );
  }

  _renderErrors = () => {
    if (this.state.errorMessage) {
      return <div style={SharedStyles.errorMessage}>{this.state.errorMessage}</div>;
    } else {
      return null;
    }
  }

  _renderLoading = () => {
    return (
      <div style={Styles.loadingContainer}>
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
        {this.state.loadingMessage &&
          <div style={Styles.loadingText}>
            {this.state.loadingMessage}
          </div>
        }
      </div>
    );
  }

  _onProjectNameChange = (event) => {
    let newValue = IdentifierRules.normalizeProjectNameWhileTyping(event.target.value);
    this.setState({projectName: newValue});
  };

  _getShortProjectDirectory = () => {
    let dir = this.state.projectDirectory;
    if (dir.length < 40) {
      return dir;
    } else {
      return `${dir.substr(0, 20)}...${dir.substr(dir.length - 20)}`;
    }
  }

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
  }

  _onClickCancel = (event) => {
    event.preventDefault();
    this.props.onClose();
  };

  _onSubmitNewProject = async (event) => {
    event.preventDefault();

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
      let projectRoot = await Exp.createNewExpAsync(this.state.selectedTemplate.id, this.state.projectDirectory, {}, {
        name: this.state.projectName,
      });
      if (!projectRoot) {
        this.setState({
          isLoading: false,
        });
        return;
      }

      await this.props.onSelectProject(projectRoot);
      this.props.onClose();
    } catch (e) {
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
    marginBottom: 10,
    overflowX: 'auto',
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
    paddingTop: StyleConstants.gutterMd,
    paddingBottom: StyleConstants.gutterMd,
    borderRadius: 4,
    cursor: 'pointer',
  },
  largeText: {
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
};

module.exports = NewProjectModal;
