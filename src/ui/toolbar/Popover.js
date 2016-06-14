import React, {PropTypes} from 'react';
import {Motion, spring} from 'react-motion';

import StyleConstants from '../StyleConstants';

// To visually align the popover
const ARROW_OFFSET = 20;
const POPOVER_OFFSET = -10;

export default class Popover extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    body: PropTypes.node,
    isToLeft: PropTypes.bool,
  };

  render() {
    const popoverStyle = this.props.isToLeft ?
      {right: POPOVER_OFFSET} : {left: POPOVER_OFFSET};
    const arrowStyle = this.props.isToLeft ?
      {right: ARROW_OFFSET} : {left: ARROW_OFFSET};

    return (
      <div style={Styles.container}>
        {this.props.children}
        <Motion defaultStyle={{x: 0}} style={{x: spring(1)}}>
          {(value) => (
            <div style={{opacity: value.x}}>
              <div style={{...Styles.popover, ...popoverStyle}}>
                <div style={{...Styles.arrow, ...arrowStyle}}></div>
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
    zIndex: StyleConstants.zIndexPopover,
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
    zIndex: 1,
  },
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
    zIndex: 2,

    position: 'relative',
    top: 6, // To make room for the arrow
  },
};
