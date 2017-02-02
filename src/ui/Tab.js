import React, {PropTypes} from 'react';

import StyleConstants from './StyleConstants';

export default class Tab extends React.Component {
  static propTypes = {
    bottomBarLeftContent: PropTypes.node,
    bottomBarRightContent: PropTypes.node,
    onClickClearLogs: PropTypes.func,
  };

  render() {
    let { bottomBarLeftContent, bottomBarRightContent } = this.props;
    if (!bottomBarLeftContent) {
      bottomBarLeftContent = (<div />);
    }
    if (!bottomBarRightContent) {
      bottomBarRightContent = (<div />);
    }

    /* eslint-disable react/jsx-no-bind */
    return (
      <div style={Styles.container}>
        {React.Children.only(this.props.children)}
        <div style={Styles.bottomBar}>
          <div style={Styles.bottomBarLeft}>
            {bottomBarLeftContent}
          </div>
          <div style={Styles.bottomBarRight}>
            {this._renderClearLogs()}
            {bottomBarRightContent}
          </div>
        </div>
      </div>
    );
    /* eslint-enable react/jsx-no-bind */
  }

  _renderClearLogs = () => {
    if (!this.props.onClickClearLogs) {
      return null;
    }

    return (
      <a style={Styles.clearButtonLink} onClick={this.props.onClickClearLogs}>
        <img src="./IconClear.png" style={Styles.clearButton} />
      </a>
    );
  }
}

const Styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  bottomBar: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
    display: 'flex',
  },
  bottomBarLeft: {
    flex: 4, // left side needs more space
  },
  bottomBarRight: {
    flex: 1,
    textAlign: 'right',
    paddingRight: StyleConstants.gutterLg,
    marginVertical: StyleConstants.gutterSm,
  },
  clearButtonLink: {
    cursor: 'pointer',
    fontSize: StyleConstants.fontSizeSm,
    color: StyleConstants.colorText,
    textDecoration: 'none',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    verticalAlign: 'middle',
  },
  clearButton: {
    maxHeight: 10,
    maxWidth: 10,
    margin: 6,
  },
};
