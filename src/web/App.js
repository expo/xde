let React = require('react');

let autobind = require('autobind-decorator');

let Commands = require('./Commands');
let MainMenu = require('./MainMenu');
let NgrokPanel = require('./NgrokPanel');
let PackagerConsole = require('./PackagerConsole');

let Button = require('react-bootstrap/lib/Button');
let ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');


class App extends React.Component {

  constructor() {
    super();
    this.state = {
      packagerController: null,
    }
  }

  render() {

    return (
      <div>
        {this._renderButtons()}

        <PackagerConsole packagerController={this.state.packagerController} />
      </div>
    );

  }

  _renderButtons() {
    return (
      <ButtonToolbar>
        <Button bsSize='medium' active onClick={this._newClicked}>New</Button>
        <Button bsSize='medium' active>Open</Button>
        <Button bsSize='medium' active>Restart Packager</Button>
        <Button bsSize='medium' active>Send Link</Button>
        {/*
        <Button bsSize='medium' active>Button</Button>
        <Button bsStyle='primary' bsSize='medium' active>Primary button</Button>
        <Button bsSize='medium' active>Button</Button>
        */}
      </ButtonToolbar>
    );
  }

  @autobind
  _newClicked() {
    Commands.new();
  }

  @autobind
  _openClicked() {
    Commands.open();
  }

  componentDidMount() {

    let runPackager = require('../commands/runPackager');
    // let runPackager = require('remote').require('../build/commands/runPackager');
    runPackager.runAsync({
      root: '/Users/ccheever/tmp/icecubetray',
    }, {}).then((pc) => {
      this.setState({packagerController: pc});
      pc.getUrlAsync().then(console.log, console.error);

    }).then(console.log, console.error);

  }

};

module.exports = App;
