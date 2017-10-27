/**
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, css } from 'aphrodite/no-important';
import StyleConstants from '../StyleConstants';

class StatusItem extends Component {
  props: {
    icon: ReactElement<*>,
    right: ReactElement<*>,
    onClick?: (e: any) => void,
    style?: Object,
  };

  static defaultProps = {
    onClick: () => {},
  };

  render() {
    return (
      <span className={css(Styles.container)} style={this.props.style} onClick={this.props.onClick}>
        <figure className={css(Styles.icon)}>{this.props.icon}</figure>
        <span className={css(Styles.right)}>{this.props.right}</span>
      </span>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  icon: {
    flexShrink: 0,
    height: '100%',
    boxSizing: 'border-box',
    paddingLeft: StyleConstants.gutterLg,
    paddingBottom: StyleConstants.gutterSm,
  },
  right: {
    minWidth: '10%',
    paddingLeft: StyleConstants.gutterMd,
    paddingBottom: StyleConstants.gutterSm,
    boxSizing: 'border-box',
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export default StatusItem;
