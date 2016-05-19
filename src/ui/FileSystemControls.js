import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';

import autobind from 'autobind-decorator';
import {
  FileSystem,
} from 'xdl';

import OverlayTooltip from './OverlayTooltip';

class FileSystemControls extends React.Component {
  render() {

    let buttonSpacing = 25;
    return (
      <div style={Object.assign({}, styles.bar, this.props.style)}>
        <ButtonToolbar>
          <OverlayTooltip tooltip="This will open a Finder window at the root of your project">
            <Button style={{marginRight: buttonSpacing}} onClick={this._showProjectInFinder}>
              Show Project in Finder
            </Button>
          </OverlayTooltip>
          <OverlayTooltip tooltip="This will open an iTerm or Terminal window cd-ed to the root directory of your project">
            <Button style={{marginRight: buttonSpacing}} onClick={this._openProjectFolderInTerminal}>
              Open Project Folder in Terminal
            </Button>
          </OverlayTooltip>
          <OverlayTooltip tooltip="This will open your project in a text editor. It will try to guess what editor you are using by looking at popular text editors that you have open and/or installed (ex. Atom, Sublime Text, TextWrangler, Text Mate, etc.)">
            <Button onClick={this._openProjectInEditor}>Open Project in Editor</Button>
          </OverlayTooltip>
        </ButtonToolbar>
      </div>
    );
  }

  @autobind
  _showProjectInFinder() {
    let dir = this._dir();
    console.log("dir=", dir);
    FileSystem.openFinderToFolderAsync(this._dir()).catch((err) => {
      console.error(err);
    });
  }

  @autobind
  _openProjectFolderInTerminal() {
    FileSystem.openFolderInItermOrTerminalAsync(this._dir()).catch((err) => {
      console.error(err);
    });
  }

  @autobind
  _openProjectInEditor() {
    FileSystem.openProjectInEditorAsync(this._dir()).catch((err) => {
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
