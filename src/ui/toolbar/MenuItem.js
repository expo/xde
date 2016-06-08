import React, {PropTypes} from 'react';

import StyleConstants from '../StyleConstants';

export default class MenuItem extends React.Component {
  static propTypes = {
    isDisabled: PropTypes.bool,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    shortcut: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {isHovered: false};
  }

  _onMouseOver = () => {
    this.setState({isHovered: true});
  };

  _onMouseOut = () => {
    this.setState({isHovered: false});
  };

  _onClick = (event) => {
    if (this.props.isDisabled) {
      event.stopPropagation();
    } else {
      this.props.onClick(event);
    }
  };

  render() {
    const menuItemStyle = Object.assign({}, Styles.menuItem,
      this.state.isHovered && !this.props.isDisabled && Styles.menuItemHovered,
      this.props.isDisabled && Styles.menuItemDisabled);
    return (
      <li style={menuItemStyle}
        onClick={this._onClick}
        onMouseOver={this._onMouseOver}
        onMouseOut={this._onMouseOut}>
        <div style={Styles.label}>{this.props.label}</div>
        {this.props.shortcut && (
          <div style={Styles.shortcut}>⌘{this.props.shortcut}</div>
        )}
      </li>
    );
  }
}

const Styles = {
  menuItem: {
    color: StyleConstants.colorText,
    cursor: 'pointer',
    display: 'flex',
    paddingTop: StyleConstants.gutterSm,
    paddingRight: StyleConstants.gutterMd,
    paddingBottom: StyleConstants.gutterSm,
    paddingLeft: StyleConstants.gutterMd,
  },
  menuItemHovered: {
    backgroundColor: StyleConstants.colorPrimary,
    color: 'white',
  },
  menuItemDisabled: {
    color: StyleConstants.colorSubtitle,
    cursor: 'default',
  },
  label: {
    flex: 1,
  },
  shortcut: {
    color: StyleConstants.colorSubtitle,
    flex: 'none',
  },
};
