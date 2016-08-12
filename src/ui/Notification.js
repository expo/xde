import React, {PropTypes} from 'react';

import StyleConstants from './StyleConstants';

let MAX_LENGTH = 150;

export default class Notification extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['success', 'error', 'warning']),
    message: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  };

  _onClick = (event) => {
    event.stopPropagation();
    if (this.props.onClick) {
      this.props.onClick();
    }
  };

  render() {
    let color;
    switch (this.props.type) {
      case 'error':
        color = StyleConstants.colorError;
        break;
      case 'warning':
        color = StyleConstants.colorWarning;
        break;
      default:
        color = StyleConstants.colorPrimary;
        break;
    }

    let message = this.props.message;
    if (message.length > MAX_LENGTH) {
      message = `${message.substring(0, MAX_LENGTH)}...`;
    }

    return (
      <div
        style={{
          ...Styles.container,
          backgroundColor: color,
          cursor: this.props.onClick ? 'pointer' : 'default',
        }} onClick={this._onClick}>
        {message}
      </div>
    );
  }
}

const Styles = {
  container: {
    color: 'white',
    padding: StyleConstants.gutterMd,
    textAlign: 'center',

    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
  },
};
