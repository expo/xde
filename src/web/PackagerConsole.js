let React = require('react');

let autobind = require('autobind-decorator');

let StyleConstants = require('./StyleConstants');

class PackagerConsole extends React.Component {

  constructor() {
    super();
    this.state = {
      packagerLogs: '',
      packagerErrors: '',
    };
  }

  render() {
    return (
      <div>
        <div style={{width: '100%',}}>
          <span style={{
              width: '50%',
          }}>Packger Logs</span>
          <span stlye={{
              width: '50%',
          }}>Packager Errors</span>

        </div>
        <div style={{width: '100%',}}>
          <textarea readOnly key="packagerLogs" style={{
              fontFamily: ['Menlo', 'Courier', 'monospace'],
              width: '50%',
          }}>
            {this.state.packagerLogs}
          </textarea>
          <textarea readOnly key="packagerErrors" style={{
              fontFamily: ['Menlo', 'Courier', 'monospace'],
              color: 'red',
              width: '50%',
          }}>
            {this.state.packagerErrors}
          </textarea>
        </div>
      </div>
    );
  }

}

module.exports = PackagerConsole;
