import _ from 'lodash';
import bunyan from 'bunyan';
import { StyleRoot } from 'radium';
import LoadingIndicator from 'react-loading-indicator';
import React, {PropTypes} from 'react';

import StyleConstants from './StyleConstants';

export default class ConsoleLog extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    logs: PropTypes.arrayOf(PropTypes.object),
    bottomBarLeftContent: PropTypes.node,
    bottomBarRightContent: PropTypes.node,
    onClickClearLogs: PropTypes.func,
  };

  componentWillUpdate() {
    // Don't keep scrolling down, unless already scrolled to bottom.
    // From http://blog.vjeux.com/2013/javascript/scroll-position-with-react.html
    const node = this._scrollContainerRef;
    if (node) {
      this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
    }
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      const node = this._scrollContainerRef;
      if (node) {
        node.scrollTop = node.scrollHeight;
      }
    }
  }

  componentWillReceiveProps = (nextProps) => {
    // When the loading indicator appears or is hidden, force a redraw.
    let oldIsLoading = this.props.isLoading;
    let newIsLoading = nextProps.isLoading;
    if (oldIsLoading !== newIsLoading && this._grid) {
      requestAnimationFrame(() => {
        this._cellMeasurer.resetMeasurements();
        this._grid.recomputeGridSize();
      });
    }
  }

  _logHasPadding = (index) => {
    let log = this.props.logs[index];
    return log.tag === 'exponent' || log.type === 'global' || log.type === 'notifications';
  }

  _lastLogHasPadding = (index) => {
    if (index === 0) {
      return false;
    } else {
      return this._logHasPadding(index - 1);
    }
  }

  _renderLog = ({ rowIndex }) => {
    let index = rowIndex;
    if (index >= this.props.logs.length) {
      return this._renderLoading();
    }

    let log = this.props.logs[index];
    let message = log.msg;
    let logStyle = Styles.logDefault;
    if (LOG_LEVEL_TO_STYLE[log.level]) {
      logStyle = LOG_LEVEL_TO_STYLE[log.level];
    }

    let time = log.time.toLocaleTimeString();

    message = _.trim(message);

    // Give important messages more space
    let paddingTop = 0;
    let paddingBottom = 0;
    if (log.tag === 'exponent' || log.type === 'global' || log.type === 'notifications') {
      paddingBottom = 20;
      if (index > 0 && !this._lastLogHasPadding(index)) {
        paddingTop = 20;
      }
    }

    if (index === 0) {
      paddingTop = StyleConstants.gutterLg;
    }

    // Lower priority of packager logs
    if (log.tag === 'packager' && log.level === bunyan.INFO) {
      logStyle = Styles.logDebug;
    }

    // A big chunk of json is logged right when an app starts. Lower the priority.
    if (log.tag === 'device' && message.includes('Running application') && message.includes('with appParams')) {
      logStyle = Styles.logDebug;
    }

    // console.group
    let paddingLeft = 0;
    if (log.groupDepth) {
      paddingLeft = log.groupDepth * 20;
    }

    let otherStyles = {};
    if (message.includes('Project opened!')) {
      otherStyles = Styles.bigLog;
    }

    return (
      <div key={index} style={{...Styles.logContainer, paddingTop, paddingBottom}}>
        <span style={Styles.logTime}>{time}</span>
        <pre style={{...Styles.log, ...logStyle, paddingLeft, ...otherStyles}}>{message}</pre>
      </div>
    );
  }

  _renderLoading() {
    let { isLoading } = this.props;

    if (isLoading) {
      return (
        <StyleRoot style={Styles.loadingIndicator} key={-1}>
          <LoadingIndicator color={{red: 255, green: 255, blue: 255, alpha: 1}} />
        </StyleRoot>
      );
    } else {
      return (
        <div key={-2} />
      );
    }
  }

  render() {
    // add extra row for loading container
    let numRows = this.props.logs.length + 1;

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
        <div
          style={Styles.logs}
          ref={(c) => { this._scrollContainerRef = c; }}>
          {_.range(numRows).map(rowIndex => this._renderLog({rowIndex}))}
        </div>
        <div style={Styles.bottomBar}>
          <div style={Styles.bottomBarLeft}>
            {bottomBarLeftContent}
          </div>
          <div style={Styles.bottomBarRight}>
            <a style={Styles.clearButtonLink} onClick={this.props.onClickClearLogs}>
              <img src="./IconTrash.png" style={Styles.clearButton} />
            </a>
            {bottomBarRightContent}
          </div>
        </div>
      </div>
    );
    /* eslint-enable react/jsx-no-bind */
  }
}

const Styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  logs: {
    background: StyleConstants.colorDarkBackground,
    fontSize: StyleConstants.fontSizeMd,
    height: '100%',
    overflowY: 'auto',
    padding: StyleConstants.gutterLg,
    flex: '1',
  },
  logContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  log: {
    background: StyleConstants.colorDarkBackground,
    whiteSpace: 'pre-wrap',
  },
  bigLog: {
    fontSize: StyleConstants.fontSizeLg,
  },
  logDebug: {
    color: StyleConstants.colorDebug,
  },
  logDefault: {
    color: 'white',
  },
  logWarning: {
    color: StyleConstants.colorWarning,
  },
  logError: {
    color: StyleConstants.colorError,
  },
  logTime: {
    fontSize: StyleConstants.fontSizeSm,
    color: StyleConstants.colorSubtitle,
    width: 85,
    minWidth: 85,
  },
  loadingIndicator: {
    paddingLeft: StyleConstants.gutterLg,
    paddingTop: StyleConstants.gutterLg,
  },
  bottomBar: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
    display: 'flex',
  },
  bottomBarLeft: {
    flex: 1,
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
    maxHeight: 14,
    maxWidth: 14,
    margin: 4,
  },
};

const LOG_LEVEL_TO_STYLE = {
  [bunyan.DEBUG]: Styles.logDebug,
  [bunyan.INFO]: Styles.logDefault,
  [bunyan.WARN]: Styles.logWarning,
  [bunyan.ERROR]: Styles.logError,
};
