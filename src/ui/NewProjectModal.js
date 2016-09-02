import {
  Logger,
  NotificationCode,
} from 'xdl';

import React, { PropTypes } from 'react';
import LoadingIndicator from 'react-loading-indicator';

import Commands from './Commands';
import StyleConstants from './StyleConstants';
import SharedStyles from './Styles';
import * as IdentifierRules from '../IdentifierRules';

class NewProjectModal extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      isLoading: false,
      projectName: '',
      errorMessage: null,
      loadingMessage: null,
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
  }

  render() {
    return (
      <div style={Styles.container}>
        {this.state.isLoading ? this._renderLoading() : this._renderForm()}
      </div>
    );
  }

  _renderForm() {
    return (
      <form name="newProject"
        style={Styles.form}
        onSubmit={this._onSubmitNewProject}>
        <div style={Styles.largeText}>
          Choose a Project Name
        </div>
        <div style={Styles.smallText}>
          XDE will create a new directory with this name.
        </div>
        {this._renderErrors()}
        <input autoFocus type="text" style={Styles.input} ref="projectName"
          onChange={this._onProjectNameChange}
          value={this.state.projectName}
        />
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

  _renderErrors() {
    if (this.state.errorMessage) {
      return <div style={SharedStyles.errorMessage}>{this.state.errorMessage}</div>;
    } else {
      return null;
    }
  }

  _renderLoading() {
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
      let projectRoot = await Commands.newExpAsync(this.state.projectName);
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
    width: 250,
    display: 'flex',
    flexDirection: 'column',
  },
  largeText: {
    color: StyleConstants.colorText,
    fontSize: StyleConstants.fontSizeLg,
    paddingBottom: StyleConstants.gutterSm,
  },
  smallText: {
    color: StyleConstants.colorSubtitle,
    fontSize: StyleConstants.fontSizeSm,
    paddingBottom: StyleConstants.gutterLg,
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
    ...SharedStyles.input,

    display: 'block',
    width: '100%',
    marginBottom: StyleConstants.gutterLg,
  },
};

module.exports = NewProjectModal;
