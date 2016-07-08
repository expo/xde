import _ from 'lodash';
import bunyan from 'bunyan';
import LoadingIndicator from 'react-loading-indicator';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

import StyleConstants from './StyleConstants';

export default class ConsoleLog extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    logs: PropTypes.arrayOf(PropTypes.object),
  };

  componentWillUpdate() {
    // Don't keep scrolling down, unless already scrolled to bottom.
    // From http://blog.vjeux.com/2013/javascript/scroll-position-with-react.html
    const node = ReactDOM.findDOMNode(this);
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      const node = ReactDOM.findDOMNode(this);
      node.scrollTop = node.scrollHeight;
    }
  }

  _renderLog(log, index) {
    if (log.shouldHide) {
      return null;
    }

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
      if (index > 0 && !this._lastLogHasPadding) {
        paddingTop = 20;
      }
      this._lastLogHasPadding = true;
    } else {
      this._lastLogHasPadding = false;
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

    return (
      <div key={index} style={{...Styles.logContainer, paddingTop, paddingBottom}}>
        <span style={Styles.logTime}>{time}</span>
        <pre style={{...Styles.log, ...logStyle, paddingLeft}}>{message}</pre>
      </div>
    );
  }

  _renderLoading() {
    return (
      <LoadingIndicator color={{red: 255, green: 255, blue: 255, alpha: 1}} />
    );
  }

  render() {
    this._lastLogHasPadding = false;
    return (
      <div style={Styles.logs}>
        {this.props.logs.map((log, index) => this._renderLog(log, index))}
        {(this.props.isLoading || this.props.logs.length === 0) && this._renderLoading()}
      </div>
    );
  }
}

const Styles = {
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
};

const LOG_LEVEL_TO_STYLE = {
  [bunyan.DEBUG]: Styles.logDebug,
  [bunyan.INFO]: Styles.logDefault,
  [bunyan.WARN]: Styles.logWarning,
  [bunyan.ERROR]: Styles.logError,
};
