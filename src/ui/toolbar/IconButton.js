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
    const containerStyle = {
      ...Styles.container,
      ...(this.props.isDisabled ? Styles.containerDisabled : {}),
    };
    const iconContainerStyle = {
      ...Styles.iconContainer,
      borderColor: this.props.color,
    };
    const iconEl = (
      <div style={iconContainerStyle}>
        <img src={this.props.iconUrl} style={Styles.icon} />
      </div>
    );

    const mainEl = this.props.popover ?
      <Popover isToLeft={this.props.isPopoverToLeft}
        body={this.props.popover}
        arrowOffset={20} popoverOffset={-10}>{iconEl}</Popover> :
      iconEl;

    return (
      <button style={{...containerStyle, ...this.props.style}}
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

const Styles = {
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
};
