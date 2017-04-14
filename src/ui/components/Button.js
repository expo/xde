/**
 * @flow
 */

import React from 'react';
import { StyleSheet, css } from 'aphrodite/no-important';

import StyleConstants from 'xde/ui/StyleConstants';
import LoadingIndicator from 'react-loading-indicator';

type Props = {
  styles?: Array<any> | any,
  children?: any,
  isLoading?: boolean,
  renderRightIcon: () => React.Element<*>,
};

export default class Button extends React.Component {
  props: Props;

  render() {
    const {
      styles: extraStyles,
      isLoading,
      renderRightIcon,
      ...buttonProps
    } = this.props;

    let content = [
      <img
        key="spacer"
        src="./arrow.svg"
        style={{
          width: 15,
          height: 15,
          opacity: 0,
        }}
      />,
      <div key="content" style={{ flex: 1 }}>
        {this.props.children}
      </div>,
      this.props.renderRightIcon && this.props.renderRightIcon(),
    ];

    if (this.props.isLoading) {
      content = (
        <LoadingIndicator
          color={{ red: 255, green: 255, blue: 255, alpha: 1 }}
        />
      );
    }

    return (
      <button
        className={css(
          styles.button,
          ...(Array.isArray(extraStyles) ? extraStyles : [extraStyles])
        )}
        {...buttonProps}>
        {content}
      </button>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: StyleConstants.colorPrimary,
    opacity: 0.9,
    border: 'none',
    borderRadius: 5,
    color: 'white',
    padding: 8,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    transition: 'opacity .5s ease',
    ':hover': {
      opacity: 1,
    },
  },
});
