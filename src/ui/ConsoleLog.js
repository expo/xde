import _ from 'lodash';
import { StyleSheet, css } from 'aphrodite';
import bunyan from '@expo/bunyan';
import LoadingIndicator from 'react-loading-indicator';
import React, { PropTypes } from 'react';
import Linkify from 'react-linkify';
import { FileSystem } from 'xdl';

import StyleConstants from './StyleConstants';

class StackFrame extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    projectRoot: PropTypes.string.isRequired,
    className: PropTypes.any,
    linkClassName: PropTypes.any,
  };

  render() {
    let { className, linkClassName, text } = this.props;

    return (
      <div className={className}>
        {text.indexOf('node_modules') === 0 ? '- ' : '* '}
        {this._renderMessage()}
      </div>
    );
  }

  _renderMessage = () => {
    if (process.platform === 'darwin') {
      let { path, lineNumber, columnNumber, methodName } = this._extractParts(this.props.text);
      return (
        <span>
          <a className={this.props.linkClassName} onClick={() => this._openFile(path)}>
            {path}
          </a>:{lineNumber}:{columnNumber} in {methodName}
        </span>
      );
    } else {
      return this.props.text;
    }
  };

  _openFile = path => {
    FileSystem.openFileInEditorAsync(`${this.props.projectRoot}/${path}`);
  };

  _extractParts(text) {
    let parts = text.split(' ');
    // path:line:col in methodName
    // path could potentially included spaces, method name cannot
    let methodName = parts[parts.length - 1];
    let pathWithNumbers = parts.slice(0, parts.length - 2).join('');
    let pathParts = pathWithNumbers.split(':');
    let columnNumber = pathParts[pathParts.length - 1];
    let lineNumber = pathParts[pathParts.length - 2];
    let path = pathParts.slice(0, pathParts.length - 2).join('');

    return {
      methodName,
      path,
      columnNumber,
      lineNumber,
    };
  }
}

class CollapsableLogRow extends React.Component {
  static defaultProps = {
    initialStateExpanded: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      collapsed: !props.initialStateExpanded,
    };
  }
  _toggleCollapse = () => {
    this.setState(state => ({ collapsed: !state.collapsed }));
  };

  render() {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {this.props.renderLeftMsg(this._toggleCollapse)}
          {this.props.renderMsg(this._toggleCollapse, this.state.collapsed)}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            marginTop: 2,
            marginBottom: 15,
          }}>
          {this.props.renderLeftSpacer()}
          {this.props.renderCollapsable(this.state.collapsed)}
        </div>
      </div>
    );
  }
}

export default class ConsoleLog extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    logs: PropTypes.arrayOf(PropTypes.object),
    projectRoot: PropTypes.string,
    // Each log must have:
    //   msg
    //   level
    //   time || leftMsg
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

  componentWillReceiveProps = nextProps => {
    // When the loading indicator appears or is hidden, force a redraw.
    let oldIsLoading = this.props.isLoading;
    let newIsLoading = nextProps.isLoading;
    if (oldIsLoading !== newIsLoading && this._grid) {
      requestAnimationFrame(() => {
        this._cellMeasurer.resetMeasurements();
        this._grid.recomputeGridSize();
      });
    }
  };

  _renderLog = ({ rowIndex }) => {
    let index = rowIndex;
    if (index >= this.props.logs.length) {
      return this._renderLoading();
    }
    let log = this.props.logs[index];

    if (log.tag === 'device' && log.includesStack) {
      return this._renderLogWithStackTrace(log, index);
    } else {
      return this._renderLogPlain(log, index);
    }
  };

  _renderLogWithStackTrace = (log, index) => {
    let message;
    let stack;

    try {
      let data = JSON.parse(log.msg);
      message = data.message;
      stack = data.stack;
    } catch (e) {
      return this._renderLogPlain(log, index);
    }

    return (
      <div key={index} style={this._getLogContainerStyles(log, index)}>
        <CollapsableLogRow
          initialStateExpanded={log.level === bunyan.ERROR}
          renderLeftMsg={() => this._renderLeftMsgPlain(log)}
          renderLeftSpacer={() => this._renderLeftSpacer()}
          renderMsg={(toggle, collapsed) => {
            return (
              <pre style={this._getLogPreStyles(log, index)}>
                <a onClick={toggle} className={css(styles.collapseToggle)}>
                  {collapsed ? '▶' : '▼'}
                </a>
                {message}
              </pre>
            );
          }}
          renderCollapsable={collapsed => {
            if (collapsed) {
              return null;
            }

            return (
              <pre style={this._getLogPreStyles(log, index)}>
                {stack
                  .split('\n')
                  .map(line => (
                    <StackFrame
                      className={css(styles.stackFrame)}
                      linkClassName={css(styles.stackFrameLink)}
                      projectRoot={this.props.projectRoot}
                      text={line}
                    />
                  ))}
              </pre>
            );
          }}
        />
      </div>
    );
  };

  _renderLeftMsgCollapsable = (log, toggle) => {
    let leftMsg = log.time ? log.time.toLocaleTimeString() : log.leftMsg;

    let leftMsgStyle = {
      ...InlineStyles.logLeftMsg,
    };
    if (log.leftMsgColor) {
      leftMsgStyle.color = log.leftMsgColor;
    }

    return (
      <span style={leftMsgStyle}>
        {leftMsg}
        <a onClick={toggle}>v</a>
      </span>
    );
  };

  _renderLogPlain = (log, index) => {
    let message = _.trim(log.msg);

    return (
      <div key={index} style={{ ...this._getLogContainerStyles(log, index), marginBottom: 3 }}>
        {this._renderLeftMsgPlain(log)}
        <pre style={this._getLogPreStyles(log, index)}>
          {this._shouldLinkify(log) ? <Linkify>{message}</Linkify> : message}
        </pre>
      </div>
    );
  };

  _renderLeftSpacer() {
    return <span style={InlineStyles.logLeftMsg} />;
  }

  _renderLeftMsgPlain = log => {
    // Timestamp or custom message?
    let leftMsg = log.time ? log.time.toLocaleTimeString() : log.leftMsg;

    let leftMsgStyle = {
      ...InlineStyles.logLeftMsg,
    };
    if (log.leftMsgColor) {
      leftMsgStyle.color = log.leftMsgColor;
    }

    return <span style={leftMsgStyle}>{leftMsg}</span>;
  };

  _renderLoading() {
    let { isLoading } = this.props;

    if (isLoading) {
      return (
        <div style={InlineStyles.loadingIndicator} key={-1}>
          <LoadingIndicator color={{ red: 255, green: 255, blue: 255, alpha: 1 }} />
        </div>
      );
    } else {
      return <div key={-2} />;
    }
  }

  render() {
    // add extra row for loading container
    let numRows = this.props.logs.length + 1;

    /* eslint-disable react/jsx-no-bind */
    return (
      <div
        style={InlineStyles.logs}
        ref={c => {
          this._scrollContainerRef = c;
        }}>
        {_.range(numRows).map(rowIndex => this._renderLog({ rowIndex }))}
      </div>
    );
    /* eslint-enable react/jsx-no-bind */
  }

  _renderClearLogs = () => {
    if (!this.props.onClickClearLogs) {
      return null;
    }

    return (
      <a style={InlineStyles.clearButtonLink} onClick={this.props.onClickClearLogs}>
        <img src="./IconClear.png" style={InlineStyles.clearButton} />
      </a>
    );
  };

  _logHasPadding = index => {
    let log = this.props.logs[index];
    return (
      log.tag === 'expo' ||
      log.type === 'global' ||
      log.type === 'notifications' ||
      log.hasVerticalPadding
    );
  };

  _lastLogHasPadding = index => {
    if (index === 0) {
      return false;
    } else {
      return this._logHasPadding(index - 1);
    }
  };

  _getLogContainerStyles = (log, index) => {
    let paddingTop = 0;
    let paddingBottom = 0;
    if (
      log.tag === 'expo' ||
      log.type === 'global' ||
      log.type === 'notifications' ||
      log.hasVerticalPadding
    ) {
      paddingBottom = 20;
      if (index > 0 && !this._lastLogHasPadding(index)) {
        paddingTop = 20;
      }
    }

    // console.group
    let paddingLeft = 0;
    if (log.groupDepth) {
      paddingLeft = log.groupDepth * 20;
    }

    // Extra padding on the top
    if (index === 0) {
      paddingTop = StyleConstants.gutterLg;
    }

    return {
      ...InlineStyles.logContainer,
      paddingLeft,
      paddingTop,
      paddingBottom,
    };
  };

  _getLogPreStyles = (log, index) => {
    let message = log.msg;

    // Get log style
    let logStyle = InlineStyles.logDefault;
    if (LOG_LEVEL_TO_STYLE[log.level]) {
      logStyle = LOG_LEVEL_TO_STYLE[log.level];
    }

    // Lower priority of packager logs
    if (log.tag === 'packager' && log.level === bunyan.INFO) {
      logStyle = InlineStyles.logDebug;
    }

    // Expo logs can be "quiet" which formats them the same as packager logs
    if (log.name === 'expo' && log.level === bunyan.INFO && log.quiet) {
      logStyle = InlineStyles.logDebug;
    }

    // A big chunk of json is logged right when an app starts. Lower the priority.
    if (this._isStartupMessage(log)) {
      logStyle = InlineStyles.logDebug;
    }

    let otherStyles = {};
    if (message.includes('Project opened!')) {
      otherStyles = InlineStyles.bigLog;
    }

    // console.group
    let paddingLeft = 0;
    if (log.groupDepth) {
      paddingLeft = log.groupDepth * 20;
    }

    return {
      ...InlineStyles.log,
      ...logStyle,
      paddingLeft,
      ...otherStyles,
    };
  };

  _isStartupMessage(log) {
    let message = log.msg || '';

    if (
      log.tag === 'device' &&
      message.includes('Running application') &&
      message.includes('with appParams')
    ) {
      return true;
    }

    return false;
  }

  _shouldLinkify(log) {
    return !this._isStartupMessage(log);
  }
}

const styles = StyleSheet.create({
  stackFrame: {
    fontSize: 12,
    filter: 'saturate(20%) brightness(300%)',
    marginBottom: 2,
  },
  stackFrameLink: {
    ':hover': {
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  },
  collapseToggle: {
    color: '#888',
    width: 15,
    fontSize: 12,
    display: 'inline-block',
    ':hover': {
      cursor: 'pointer',
      textDecoration: 'none',
    },
  },
});

const InlineStyles = {
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
  logLeftMsg: {
    fontSize: StyleConstants.fontSizeSm,
    color: StyleConstants.colorSubtitle,
    width: 85,
    minWidth: 85,
  },
  loadingIndicator: {
    paddingLeft: StyleConstants.gutterLg,
    paddingTop: StyleConstants.gutterLg,
  },
};

const LOG_LEVEL_TO_STYLE = {
  [bunyan.DEBUG]: InlineStyles.logDebug,
  [bunyan.INFO]: InlineStyles.logDefault,
  [bunyan.WARN]: InlineStyles.logWarning,
  [bunyan.ERROR]: InlineStyles.logError,
};
