import React, { PropTypes } from 'react';

import StyleConstants from '../StyleConstants';

export default class MenuItem extends React.Component {
  static propTypes = {
    checkState: PropTypes.oneOf(['uncheckable', 'unchecked', 'checked']),

    isDisabled: PropTypes.bool,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    shortcut: PropTypes.string,
    color: PropTypes.string,

    // If specified, this becomes a flyout menu.
    children: PropTypes.node,
  };

  static defaultProps = {
    checkState: 'uncheckable',
  };

  constructor(props, context) {
    super(props, context);
    this.state = { isHovered: false };
  }

  _onMouseEnter = () => {
    this.setState({ isHovered: true });
  };

  _onMouseLeave = () => {
    this.setState({ isHovered: false });
  };

  _onClick = event => {
    if (this.props.isDisabled) {
      event.stopPropagation();
    } else if (this.props.onClick) {
      this.props.onClick(event);
    }
  };

  _renderFlyout() {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,

          // TODO: When we need flyouts to the left, make this customizable.
          left: 0,
          marginLeft: '100%',
        }}>
        {this.props.children}
      </div>
    );
  }

  _renderCheck() {
    // If unchecked, hold a space for the checkmark by rendering an invisible one.
    let style = this.props.checkState === 'checked' ? {} : { opacity: 0 };
    return <span style={style}>✓&nbsp;</span>;
  }

  render() {
    const isFlyoutMenu = !!this.props.children;
    const menuItemStyle = {
      ...Styles.menuItem,
      ...(this.state.isHovered && !this.props.isDisabled
        ? Styles.menuItemHovered
        : {}),
      ...(this.props.isDisabled ? Styles.menuItemDisabled : {}),
    };
    if (this.props.color) {
      menuItemStyle.color = this.props.color;
    }

    return (
      <div
        style={menuItemStyle}
        onClick={this._onClick}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}>
        {this.props.checkState !== 'uncheckable' && this._renderCheck()}
        <div style={Styles.label}>{this.props.label}</div>
        {this.props.shortcut &&
          <div style={Styles.shortcut}>
            {this._metaKey()}{this.props.shortcut}
          </div>}
        {isFlyoutMenu && <span>►</span>}
        {isFlyoutMenu && this.state.isHovered && this._renderFlyout()}
      </div>
    );
  }

  _metaKey() {
    if (process.platform === 'darwin') {
      return '⌘';
    } else {
      return 'Ctrl+';
    }
  }
}

const Styles = {
  menuItem: {
    color: StyleConstants.colorText,
    cursor: 'pointer',
    fontSize: StyleConstants.fontSizeMd,
    paddingTop: StyleConstants.gutterSm,
    paddingRight: StyleConstants.gutterMd,
    paddingBottom: StyleConstants.gutterSm,
    paddingLeft: StyleConstants.gutterMd,
    position: 'relative',
    textAlign: 'left',

    display: 'flex',
    alignItems: 'center',
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
