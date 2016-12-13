/**
 * @flow
 */

import React from 'react';

import {
  Link,
} from 'react-router';

import { StyleSheet, css } from 'aphrodite/no-important';

import Button from 'xde/ui/components/Button';
import TextInput from 'xde/ui/components/TextInput';

import StyleConstants from 'xde/ui/StyleConstants';
import * as IdentifierRules from 'xde/utils/IdentifierRules';

import type { UserObject, User, LegacyUser } from 'xdl/build/User';

export type RegisterFormData = {
  givenName: string,
  familyName: string,
  email: string,
  username?: string,
  password?: string,
};

type Props = {
  user: ?UserObject,
  isRegistering: boolean,
  onRegister: (formData: RegisterFormData) => void | Promise<void>,
}

type State = {
  username?: string,
};

export default class RegisterForm extends React.Component {
  props: Props;
  state: State;

  state = {};

  componentWillReceiveProps(nextProps: Props) {
    const { user } = this.props;
    if (user && user.kind === 'legacyUser') {
      this.setState({
        username: user.username,
      });
    }
  }

  render() {
    const { user } = this.props;

    let isLegacy = user && user.userMetadata.legacy;
    let title = "Sign Up";
    if (isLegacy) {
      title = "Update Your Account";
    }

    let form = null;
    if (user && user.kind === 'legacyUser') {
      form = this._renderLegacyForm(true);
    } else if (user && user.kind === 'user' && user.currentConnection === 'Username-Password-Authentication') {
      form = this._renderLegacyForm(false);
    } else {
      form = this._renderOnboardingForm();
    }

    return (
      <form
        name="login"
        className={css(styles.form)}
        onSubmit={this._onSubmit}>
        <div className={css(styles.innerForm)}>
          <div className={css(styles.fieldContainer)}>
            <h3 className={css(styles.title)}>{title}</h3>
            {form}
          </div>
        </div>
      </form>
    );
  }

  _renderLegacyForm(hasPasswordField: boolean) {
    const user: LegacyUser = (this.props.user: any);
    const disclosureText = `Welcome back, ${user.username}!
      We've upgraded our account system and need a little bit more information from you!
      Please fill in the form below and we'll get you on your way.`;

    return (
      <div className={css(styles.fieldContainer)}>
        {disclosureText && <span className={css(styles.disclosureText)}>{disclosureText}</span>}
        <TextInput
          ref="givenName"
          styles={styles.input}
          type="text"
          placeholder="First name"
          value=""
        />
        <TextInput
          ref="familyName"
          styles={styles.input}
          type="text"
          placeholder="Last name"
          value=""
        />
        <TextInput
          ref="email"
          styles={styles.input}
          type="text"
          placeholder="E-mail address"
          value=""
        />
        { hasPasswordField &&
          <TextInput
            ref="password"
            styles={styles.input}
            type="password"
            placeholder="Current Password"
          />
        }
        <Button
          styles={styles.button}
          type="submit"
          disabled={this.props.isRegistering}
          isLoading={this.props.isRegistering}
          renderRightIcon={() => //eslint-disable-line
            <img key="right" src="./arrow.svg" style={{width: 15, height: 15}} />
          }>
          Update My Account
        </Button>
        <p className={css(styles.smallText, styles.gray)}>
          By signing up, you agree to our terms.
        </p>
        <p className={css(styles.smallText, styles.black)}>
          Already have a username/password? <Link to="/auth/login" style={{ color: StyleConstants.colorText }}>Login</Link>
        </p>
      </div>
    );
  }

  _renderOnboardingForm() {
    const user: ?User = (this.props.user: any);
    let disclosureText = `Welcome to Exponent!`;
    if (user) {
      disclosureText = `Thanks for signing up for Exponent!
        Finish filling out your profile below.`;
    }

    return (
      <div className={css(styles.fieldContainer)}>
        {disclosureText && <span className={css(styles.disclosureText)}>{disclosureText}</span>}
        <TextInput
          ref="givenName"
          styles={styles.input}
          type="text"
          placeholder="First name"
          value={user && user.givenName}
        />
        <TextInput
          ref="familyName"
          styles={styles.input}
          type="text"
          placeholder="Last name"
          value={user && user.familyName}
        />
        <TextInput
          ref="username"
          styles={styles.input}
          type="text"
          placeholder="Username"
          valueTransformer={IdentifierRules.normalizeWhileTyping}
          value={user && (user.username || user.nickname)}
        />
        <TextInput
          ref="email"
          styles={styles.input}
          type="text"
          placeholder="E-mail address"
          value={user && user.email}
        />
        <TextInput
          ref="password"
          styles={styles.input}
          type="password"
          placeholder="Password"
        />
        <TextInput
          ref="passwordRepeat"
          styles={styles.input}
          type="password"
          placeholder="Password (repeat)"
        />
        <Button
          styles={styles.button}
          type="submit"
          disabled={this.props.isRegistering}
          isLoading={this.props.isRegistering}
          renderRightIcon={() => //eslint-disable-line
            <img key="right" src="./arrow.svg" style={{width: 15, height: 15}} />
          }>
          Sign Up
        </Button>
        <p className={css(styles.smallText, styles.gray)}>
          By signing up, you agree to our terms.
        </p>
        <p className={css(styles.smallText, styles.black)}>
          Already have a username/password? <Link to="/auth/login" style={{ color: StyleConstants.colorText }}>Login</Link>
        </p>
      </div>
    );
  }

  _onSubmit = (e: any) => {
    e.preventDefault();

    const givenName = this.refs.givenName && this.refs.givenName.getValue();
    const familyName = this.refs.familyName && this.refs.familyName.getValue();
    const email = this.refs.email && this.refs.email.getValue();
    const username = this.state.username || (this.refs.username && this.refs.username.getValue());
    const password = this.refs.password && this.refs.password.getValue();
    const passwordRepeat = this.refs.passwordRepeat && this.refs.passwordRepeat.getValue();

    if (this.props.user) {
      if (this.props.user.kind === 'legacyUser') {
        //we're upgrading an account without password
        if (!givenName ||
            !familyName ||
            !email ||
            !password) {
          alert('Please fill out all the fields.');
          return;
        }

        this.props.onRegister({
          givenName,
          familyName,
          email,
          username,
          password,
        });

        return;
      } else if (this.props.user.kind === 'user' && this.props.user.userMetadata.legacy) {
        //we're upgrading an account WITH password
        if (!givenName ||
            !familyName ||
            !email) {
          alert('Please fill out all the fields.');
          return;
        }

        this.props.onRegister({
          givenName,
          familyName,
          email,
        });

        return;
      }
    }

    if (!givenName ||
        !familyName ||
        !email ||
        !username ||
        !password ||
        !passwordRepeat) {
      alert('Please fill out all the fields.');
      return;
    }

    if (password !== passwordRepeat) {
      alert('Passwords do not match!');
      return;
    }

    this.props.onRegister({
      givenName,
      familyName,
      email,
      username,
      password,
    });
  }
}

const styles = StyleSheet.create({
  form: {
    fontFamily: 'Verdana',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  innerForm: {
    width: 550,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    width: 270,
  },

  title: {
    fontSize: 20,
    marginBottom: 40,
  },

  disclosureText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },

  input: {
    width: '100%',
    marginBottom: 20,
  },

  smallText: {
    fontSize: 12,
    marginTop: 20,
  },

  black: { color: 'rgb(89, 92, 104)' },
  gray: { color: '#aaaaaa' },
});
