let React = require('react');

let Button = require('react-bootstrap/lib/Button');
let ButtonInput = require('react-bootstrap/lib/ButtonInput');
let Input = require('react-bootstrap/lib/Input');

let Api = require('../application/Api');
let login = require('../application/login');

let autobind = require('autobind-decorator');

let STATES = {
  UNKNOWN: 'UNKNOWN',
  UP_TO_DATE: 'UP_TO_DATE',
  OUT_OF_DATE: 'OUT_OF_DATE',
};

class NewVersionAvailable extends React.Component {
  constructor() {
    super();

    this.state = {
      status: STATES.UNKNOWN,
      responseData: null,
    };
    global._NewVersionAvailable = this;
  }

  _getUpdateUrl() {
    if (this.state.responseData && this.state.responseData.updateUrl) {
      return this.state.responseData.updateUrl;
    } else {
      return 'http://exponentjs.com/';
    }
  }

  @autobind
  _goToUpdateUrl() {
    require('shell').openExternal(this._getUpdateUrl());
  }

  render() {

    switch (this.state.status) {

      case STATES.OUT_OF_DATE:
        return (
          <div style={{
            display: 'flex',
            alignSelf: 'stretch',
            flexDirection: 'column',
            margin: 'auto',
            height: 30,
            background: '#fffbe6',
            margin: 0,
            padding: 0,
            cursor: 'pointer',
          }} onClick={this._goToUpdateUrl} >
            <center style={{
              paddingTop: 4,
              fontWeight: '500',
              fontFamily: ['Helvetica Neue', 'Sans-serif'],
              fontSize: 13,
              color: '#444444',
            }}>There is a new version of XDE available <a onClick={this._goToUpdateUrl}>here</a></center>
          </div>
        );
        break;

      case STATES.UNKNOWN:
      case STATES.UP_TO_DATE:
      default:
        return (<div style={{
          display: 'none',
        }} />);
        break;
    }
  }

  componentDidMount() {

    Api.callMethodAsync('checkForUpdate', {
      product: 'xde',
      version: '0.1.0',
    }).then((responseData) => {
      let newStatus = STATES.UNKNOWN;
      switch (responseData.updateAvailable) {

        case true:
          newStatus = STATES.OUT_OF_DATE;
          break;

        case false:
          newStatus = STATES.UP_TO_DATE;
          break;

        default:
          newStatus = STATES.UNKNOWN;
          break;

      }

      this.setState({responseData, status: newStatus});

    }, (err) => {
      console.error("Failed to check to see if updates are available for XDE:", err);
    });

  }


}

module.exports = NewVersionAvailable;
