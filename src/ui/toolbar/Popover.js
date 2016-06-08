import React, {PropTypes} from 'react';
import {Motion, spring} from 'react-motion';

import StyleConstants from '../StyleConstants';

export default class Popover extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    body: PropTypes.node,
    left: PropTypes.number,
  };

  static defaultProps = {
    left: 0,
  };

  render() {
    return (
      <div style={Styles.container}>
        {this.props.children}
        <Motion defaultStyle={{x: 0}} style={{x: spring(1)}}>
          {(value) => (
            <div style={{opacity: value.x}}>
              <div style={{...Styles.popover, left: this.props.left}}>
                <div style={Styles.arrow}></div>
                <ul style={Styles.menu}>
                  {this.props.body}
                </ul>
              </div>
            </div>
          )}
        </Motion>
      </div>
    );
  }
}

const Styles = {
  container: {
    position: 'relative',
  },
  popover: {
    position: 'absolute', // For positioning arrow
    top: '100%',
  },
  arrow: {
    backgroundColor: 'white',
    borderColor: StyleConstants.colorBorder,
    borderStyle: 'solid',
    borderWidth: 1,
    transform: 'rotate(45deg)',
    width: 12,
    height: 12,

    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 1,
  },
  menu: {
    backgroundColor: 'white',
    borderColor: StyleConstants.colorBorder,
    borderStyle: 'solid',
    borderWidth: 1,
    boxShadow: `0 5px 10px ${StyleConstants.colorBorder}`,
    color: StyleConstants.colorText,
    listStyleType: 'none',
    minWidth: 170,
    paddingTop: StyleConstants.gutterSm,
    paddingBottom: StyleConstants.gutterSm,
    paddingLeft: 0,
    zIndex: 2,

    position: 'relative',
    top: 6, // To make room for the arrow
  },
};
