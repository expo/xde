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
  }

  _onClick = (event) => {
    if (!this.props.isDisabled) {
      this.props.onClick(event);
    }
  };

  render() {
    const containerStyle = {
      ...Styles.container,
      ...(this.props.isDisabled ? Styles.containerDisabled : {}),
    };
    const iconContainerStyle = {
      ...Styles.iconContainer,
      borderColor: this.props.color,
      ...(this.props.isDisabled ? Styles.iconContainerDisabled : {}),
    };
    const iconEl = (
      <div style={iconContainerStyle}>
        <img src={this.props.iconUrl} style={Styles.icon} />
      </div>
    );
    const mainEl = this.props.popover ?
      <Popover left={-12} body={this.props.popover}>{iconEl}</Popover> :
      iconEl;

    return (
      <div style={Object.assign({}, containerStyle, this.props.style)}
        onClick={this._onClick}>
        {mainEl}
        <div style={{color: this.props.color}}>
          {this.props.label}
        </div>
      </div>
    );
  }
}

const Styles = {
  container: {
    alignItems: 'center',
    display: 'inline-flex',
    flexDirection: 'column',
    fontSize: StyleConstants.fontSizeMd,
  },
  containerDisabled: {
    opacity: 0.3,
  },
  iconContainer: {
    borderRadius: '50%',
    borderStyle: 'solid',
    borderWidth: 2,
    cursor: 'pointer',
    marginBottom: StyleConstants.gutterSm,
    width: 32,
    height: 32,

    // Center the icon within the container
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDisabled: {
    cursor: 'default',
  },
  icon: {
    maxHeight: 15,
    maxWidth: 15,
  },
};
