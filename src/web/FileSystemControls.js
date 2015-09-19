let React = require('react');

let autobind = require('autobind-decorator');
let escapeHtml = require('escape-html');
let execAsync = require('exec-async');
let gitInfoAsync = require('git-info-async');
let jsonFile = require('@exponent/json-file');
let path = require('path');

let Api = require('../application/Api');
let config = require('../config');
let Commands = require('./Commands');
let Exp = require('../application/Exp');
let fileSystem = require('../application/fileSystem');
let LoginPane = require('./LoginPane');
let Menu = require('../application/Menu');
let NewVersionAvailable = require('./NewVersionAvailable');
let StyleConstants = require('./StyleConstants');
let simulator = require('../application/simulator');
let urlUtils = require('../application/urlUtils');
let userSettings = require('../application/userSettings');

let Button = require('react-bootstrap/lib/Button');
let ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
let ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');

class FileSystemControls extends React.Component {
  render() {

    let buttonSpacing = 25;
    return (
      <div style={Object.assign({}, styles.bar, this.props.style)}>
        <ButtonToolbar>
          <Button style={{marginRight: buttonSpacing,}} onClick={this._showProjectInFinder}>Show Project in Finder</Button>
          <Button style={{marginRight: buttonSpacing,}} onClick={this._openProjectFolderInTerminal}>Open Project Folder in Terminal</Button>
          <Button onClick={this._openProjectInEditor}>Open Project in Editor</Button>
        </ButtonToolbar>
      </div>
    );
  }

  @autobind
  _showProjectInFinder() {
    let dir = this._dir();
    console.log("dir=", dir);
    fileSystem.openFinderToFolderAsync(this._dir()).catch((err) => {
      console.error(err);
    });
  }

  @autobind
  _openProjectFolderInTerminal() {
    fileSystem.openFolderInItermOrTerminalAsync(this._dir()).catch((err) => {
      console.error(err);
    });
  }

  @autobind
  _openProjectInEditor() {
    fileSystem.openProjectInEditorAsync(this._dir()).catch((err) => {
      console.error(err);
    });
  }

  _dir() {
    return this.props.packagerController.opts.absolutePath;
  }

}

let styles = {
  bar: {
    marginLeft: 15,
    marginTop: 2,
    marginBottom: 6,
  },
};

module.exports = FileSystemControls;
