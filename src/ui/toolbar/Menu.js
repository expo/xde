import React, {PropTypes} from 'react';

import StyleConstants from '../StyleConstants';

export default class Menu extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    style: PropTypes.object,
  };

  static defaultProps = {
    style: {},
  };

  render() {
    return (
      <ul style={{...Styles.menu, ...this.props.style}}
        onClick={this.props.onClick}>
        {this.props.children}
      </ul>
    );
  }
}

const Styles = {
  menu: {
    backgroundColor: 'white',
    borderColor: StyleConstants.colorBorder,
    borderStyle: 'solid',
    borderWidth: 1,
    boxShadow: `0 5px 10px rgba(0, 0, 0, 0.2)`,
    color: StyleConstants.colorText,
    listStyleType: 'none',
    minWidth: 170,
    paddingLeft: 0,
  },
};
