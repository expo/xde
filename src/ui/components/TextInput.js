/**
 * @flow
 */

import React from 'react';
import { StyleSheet, css } from 'aphrodite/no-important';
import SharedStyles from 'xde/ui/Styles';

type Event = {
  target: {
    value: string,
  }
}

type Props = {
  styles?: any,
  value?: ?string,
  valueTransformer?: (val: string) => string,
  autofocus: ?boolean,
}

type State = {
  value: string,
}

export default class TextInput extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super();
    this.state = {
      value: props.value || '',
    };
  }

  getValue() {
    return this.state.value.trim();
  }

  componentDidMount() {
    if (this.props.autofocus) {
      this._input && this._input.focus();
    }
  }

  render() {
    const {
      styles: extraStyles,
      valueTransformer,
      ...inputProps
    } = this.props;

    return (
      <input
        ref={view => { this._input = view; }}
        className={css(styles.input, extraStyles)}
        {...inputProps}
        onChange={this._onValueChange}
        value={this.state.value}
      />
    );
  }

  _onValueChange = (e: Event) => {
    let value = e.target.value;
    if (this.props.valueTransformer) {
      value = this.props.valueTransformer(value);
    }
    this.setState({
      value,
    });
  }
}

const styles = StyleSheet.create({
  input: {
    ...SharedStyles.input,
    display: 'block',
  },
});
