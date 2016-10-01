import { StyleSheet, css } from 'aphrodite';
import React, {PropTypes} from 'react';

import StyleConstants from '../StyleConstants';
import Popover from './Popover';

export default class IconButton extends React.Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    iconUrl: PropTypes.string.isRequired,
    isDisabled: PropTypes.bool,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,

    // If specified, popover appears beneath icon circle on click.
    popover: PropTypes.node,
    isPopoverToLeft: PropTypes.bool,
  }

  render() {
    const containerStyles = [
      styles.container,
      (this.props.isDisabled ? styles.containerDisabled : null),
    ];
    const iconEl = (
      <div
        className={css(styles.iconContainer)}
        style={{borderColor: this.props.color}}>
        <img
          src={this.props.iconUrl}
          className={css(styles.icon)}
        />
      </div>
    );

    const mainEl = this.props.popover ?
      <Popover
        isToLeft={this.props.isPopoverToLeft}
        body={this.props.popover}
        arrowOffset={20}
        popoverOffset={-10}>
        {iconEl}
      </Popover> :
      iconEl;

    return (
      <button
        className={css(...containerStyles)}
        style={this.props.style}
        disabled={this.props.isDisabled}
        onClick={this.props.onClick}>
        {mainEl}
        <div style={{color: this.props.color}}>
          {this.props.label}
        </div>
      </button>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    display: 'inline-flex',
    flexDirection: 'column',
    fontSize: StyleConstants.fontSizeMd,
    verticalAlign: 'middle',

    // Override button styles
    background: 'transparent',
    border: 'none',
  },
  containerDisabled: {
    opacity: 0.3,
  },
  iconContainer: {
    borderRadius: '50%',
    borderStyle: 'solid',
    borderWidth: 2,
    marginBottom: StyleConstants.gutterSm,
    width: 32,
    height: 32,

    // Center the icon within the container
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    maxHeight: 15,
    maxWidth: 15,
  },
});
