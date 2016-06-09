import React, { PropTypes } from 'react';

import Button from 'react-bootstrap/lib/Button';
import Input from 'react-bootstrap/lib/Input';

import {
  User,
} from 'xdl';

import OverlayTooltip from './OverlayTooltip';
import * as UsernameRules from '../UsernameRules';

import autobind from 'autobind-decorator';

class LoginPane extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {errorMessage: null};

    global._LoginPane = this;
  }

  static propTypes = {
    loggedInAs: PropTypes.object,
    onLogout: PropTypes.func.isRequired,
  }

  render() {
    return (
      <div style={Object.assign({}, Styles.pane, {
          paddingLeft: 12,
          paddingRight: 12,
          paddingBottom: 6,
          paddingTop: 6,
      })}>
      {this._renderLoggedIn()}
      {this._renderErrors()}
      </div>
    );
  }

  @autobind
  _renderErrors() {
    if (this.state.errorMessage) {
      return (
        <div style={{
            color: 'red',
            fontSize: 13,
            fontWeight: '600',
            fontFamily: 'Helvetica Neue',
            textAlign: 'center',
            maxWidth: 250,
        }}><small>{this.state.errorMessage}</small></div>
      );
    } else {
      return null;
    }
  }

  @autobind
  _renderLoggedIn() {
    return (
      <div>
        <div style={{paddingTop: 5}}>{this.props.loggedInAs.username}</div>
        <OverlayTooltip tooltip="Logs out of exp.host">
          <Button bsSize="small" style={{
              marginTop: 5,
              alignSelf: 'center',
          }} onClick={this._logoutClicked}
          >Logout</Button>
        </OverlayTooltip>
      </div>
    );
  }

  @autobind
  _logoutClicked() {
    console.log("logout clicked");
    User.logoutAsync().then(() => {
      console.log("logout successful");
      this.setState({errorMessage: null});
      this.props.onLogout();
    }, (err) => {
      console.error("logout error:", err);
      this.setState({errorMessage: err.message});
    });
  }
}

let Styles = {
  pane: {
    backgroundColor: '#eeeeee',
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.3)',
  },
};

module.exports = LoginPane;
