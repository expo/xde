let React = require('react');

let autobind = require('autobind-decorator');

let StyleConstants = require('./StyleConstants');

class PackagerConsole extends React.Component {

  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div>
        <span>PackagerConsole!</span>
      </div>
    );
  }

}

module.exports = PackagerConsole;
