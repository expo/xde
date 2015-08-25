let React = require('react');

let Button = require('react-bootstrap/lib/Button');
let ButtonInput = require('react-bootstrap/lib/ButtonInput');
let Input = require('react-bootstrap/lib/Input');

let Api = require('../application/Api');
let login = require('../application/login');

let autobind = require('autobind-decorator');

class LoginPane extends React.Component {
  constructor() {
    super();

    this.state = {
      loggedInAs: null,
      username: null,
      password: null,
    };

    global._LoginPane = this;

  }

  render() {
    return (
      <div style={Object.assign({}, Styles.pane, {
          paddingLeft: 12,
          paddingRight: 12,
          paddingBottom: 6,
          paddingTop: 6,
      })}>
      {this.state.loggedInAs ? this._renderLoggedIn() : this._renderLoggedOut()}
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
        <div style={{paddingTop: 5}}>{this.state.loggedInAs.username}</div>
        <Button bsSize="small" style={{
            marginTop: 5,
            alignSelf: 'center',
        }} onClick={this._logoutClicked}
        >Logout</Button>
    </div>

    );
  }

  @autobind
  _renderLoggedOut() {
    return (
      <div>
        <form name="login" onSubmit={(e) => {
            e.preventDefault();
            this._loginSubmitted();
        }}>
          <div><Input type="text" bsSize="small" style={Styles.input} ref="username" onChange={(event) => {
              this.setState({username: event.target.value});
          }} placeholder="username" /></div>
          <div><Input type="password" bsSize="small" style={Styles.input} ref="password" onChange={(event) => {
            this.setState({password: event.target.value});
          }} placeholder="password" /></div>
          <Input type='submit' bsSize="small" value='Login or Create Account' />
        </form>
      </div>
    );
  }

  @autobind
  _logoutClicked() {
    console.log("logout clicked");
    login.logoutAsync().then(() => {
      console.log("logout successful");
      this.setState({loggedInAs: null, errorMessage: null});
      if (this.props.onLogout) {
        this.props.onLogout();
      }
    }, (err) => {
      console.error("logout error:", err);
      this.setState({errorMessage: err.message});
    });
  }

  @autobind
  _loginSubmitted() {
    console.log("login clicked");
    login.loginOrAddUserAsync({
      username: this.state.username,
      password: this.state.password,
    }).then((result) => {
      console.log("login successful");
      this.setState({
        errorMessage: null,
        loggedInAs: result.user,
      });
      if (this.props.onLogin) {
        this.props.onLogin(result.user);
      }
    }, (err) => {
      console.error("login error:", err);
      this.setState({errorMessage: err.message});
      console.error(err);
    });
    // console.log("username=", this.state.username, "password=", this.state.password);

  }

  componentDidMount() {
    Api.callMethodAsync('whoami', []).then((result) => {
      this.setState({loggedInAs: result.user});
      if (result.user && this.props.onLogin) {
        this.props.onLogin(result.user);
      }
    }, (err) => {
      this.setState({errorMessage: err.message});
    });
  }

}

let Styles = {
  pane: {
    backgroundColor: '#eeeeee',
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.3)',
  },
  input: {
    // borderRadius: 3,
    // width: 200,
    // fontFamily: ['Verdana', 'Helvetica Neue', 'Verdana', 'Helvetica', 'Arial', 'Sans-serif'],
    // fontSize: 11,
    // fontWeight: '200',
  },
  submit: {
    // borderRadius: 3,
    // width: 200,
  },
};

module.exports = LoginPane;
