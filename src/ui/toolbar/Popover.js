import React, { PropTypes } from 'react';
import { Motion, spring } from 'react-motion';

import SharedStyles from '../Styles';
import StyleConstants from '../StyleConstants';

export default class Popover extends React.Component {
  static propTypes = {
    children: PropTypes.node, // Target over which the popover is shown.

    // Popover contents. If not specified, only the children are shown.
    body: PropTypes.node,

    isToLeft: PropTypes.bool,
    isAbove: PropTypes.bool,
    arrowOffset: PropTypes.number,
    popoverOffset: PropTypes.number,
  };

  static defaultProps = {
    arrowOffset: 0,
    popoverOffset: 0,
  };

  _renderPopoverContents() {
    let popoverStyle = this.props.isAbove ? Styles.popoverAbove : Styles.popoverBelow;
    let arrowStyle = this.props.isAbove ? Styles.arrowAbove : Styles.arrowBelow;
    let arrowFillStyle = this.props.isAbove ? Styles.arrowFillAbove : Styles.arrowFillBelow;
    let contentStyle = this.props.isAbove ? Styles.contentAbove : Styles.contentBelow;

    if (this.props.isToLeft) {
      popoverStyle.right = this.props.popoverOffset;
      arrowStyle.right = this.props.arrowOffset;
      arrowFillStyle.right = this.props.arrowOffset + 1;
      popoverStyle.left = null;
      arrowStyle.left = null;
      arrowFillStyle.left = null;
    } else {
      popoverStyle.left = this.props.popoverOffset;
      arrowStyle.left = this.props.arrowOffset;
      arrowFillStyle.left = this.props.arrowOffset + 1;
      popoverStyle.right = null;
      arrowStyle.right = null;
      arrowFillStyle.right = null;
    }

    return (
      <Motion defaultStyle={{ x: 0 }} style={{ x: spring(1) }}>
        {value => (
          <div>
            {this.props.isAbove ? (
              <div style={{ ...popoverStyle, opacity: value.x }}>
                <div style={contentStyle}>{this.props.body}</div>
                <div style={arrowFillStyle} />
                <div style={arrowStyle} />
              </div>
            ) : (
              <div style={{ ...popoverStyle, opacity: value.x }}>
                <div style={arrowStyle} />
                <div style={arrowFillStyle} />
                <div style={contentStyle}>{this.props.body}</div>
              </div>
            )}
          </div>
        )}
      </Motion>
    );
  }

  render() {
    return (
      <div style={Styles.container}>
        {this.props.children}
        {this.props.body && this._renderPopoverContents()}
      </div>
    );
  }
}

const ARROW_SIZE = 12;

const Styles = {
  container: {
    display: 'inline-block',
    position: 'relative',
  },

  popoverBelow: {
    position: 'absolute',
    top: '100%',
    zIndex: StyleConstants.zIndexPopover,
  },
  arrowBelow: {
    backgroundColor: 'white',
    borderColor: StyleConstants.colorBorder,
    borderStyle: 'solid',
    borderWidth: 1,
    transform: 'rotate(45deg)',
    width: ARROW_SIZE,
    height: ARROW_SIZE,

    position: 'absolute',
    top: 1,
    zIndex: 1,
  },
  contentBelow: {
    position: 'relative',
    top: ARROW_SIZE / 2, // To make room for the arrow
    zIndex: 2, // Higher than the arrow

    paddingTop: ARROW_SIZE / 2 + 1,
    paddingBottom: ARROW_SIZE / 2 + 1,
    ...SharedStyles.hoverBox,
  },
  arrowFillBelow: {
    backgroundColor: 'white',
    border: 'none',
    transform: 'rotate(45deg)',
    width: 10,
    height: 10,

    position: 'absolute',
    top: 2,
    zIndex: 3, // Higher than content
  },

  popoverAbove: {
    position: 'absolute',
    bottom: '100%',
    zIndex: StyleConstants.zIndexPopover,
  },
  arrowAbove: {
    backgroundColor: 'white',
    borderColor: StyleConstants.colorBorder,
    borderStyle: 'solid',
    borderWidth: 1,
    transform: 'rotate(225deg)',
    width: ARROW_SIZE,
    height: ARROW_SIZE,

    position: 'absolute',
    bottom: 1,
    zIndex: 1,
  },
  contentAbove: {
    position: 'relative',
    bottom: ARROW_SIZE / 2, // To make room for the arrow
    zIndex: 2, // Higher than the arrow

    paddingTop: ARROW_SIZE / 2 + 1,
    paddingBottom: ARROW_SIZE / 2 + 1,
    ...SharedStyles.hoverBox,
  },
  arrowFillAbove: {
    backgroundColor: 'white',
    border: 'none',
    transform: 'rotate(225deg)',
    width: 10,
    height: 10,

    position: 'absolute',
    bottom: 2,
    zIndex: 3, // Higher than content
  },
};
