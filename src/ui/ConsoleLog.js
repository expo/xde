import _ from 'lodash';
import bunyan from 'bunyan';
import { StyleRoot } from 'radium';
import LoadingIndicator from 'react-loading-indicator';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {
  AutoSizer,
  CellMeasurer,
  Grid,
} from 'react-virtualized';

import StyleConstants from './StyleConstants';

export default class ConsoleLog extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    logs: PropTypes.arrayOf(PropTypes.object),
  };

  componentWillUpdate() {
    // Don't keep scrolling down, unless already scrolled to bottom.
    // From http://blog.vjeux.com/2013/javascript/scroll-position-with-react.html
    let node = this._grid;
    if (node && node._scrollingContainer) {
      let element = ReactDOM.findDOMNode(node._scrollingContainer);
      this.shouldScrollBottom = element.scrollTop + element.offsetHeight === element.scrollHeight;
    }
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      let node = this._grid;
      if (node && node._scrollingContainer) {
        let element = ReactDOM.findDOMNode(node._scrollingContainer);
        element.scrollTop = element.scrollHeight;
      }
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

    return (
      <div key={index} style={{...Styles.logContainer, paddingTop, paddingBottom}}>
        <span style={Styles.logTime}>{time}</span>
        <pre style={{...Styles.log, ...logStyle, paddingLeft}}>{message}</pre>
      </div>
    );
  }

  _renderLoading() {
    return (
      <StyleRoot style={Styles.loadingIndicator}>
        <LoadingIndicator color={{red: 255, green: 255, blue: 255, alpha: 1}} />
      </StyleRoot>
    );
  }

  render() {
    let isLoading = this.props.isLoading || this.props.logs.length === 0;
    let numRows = this.props.logs.length;
    if (isLoading) {
      numRows++;
    }

    /* eslint-disable react/jsx-no-bind */
    return (
      <div style={Styles.container}>
        <AutoSizer>
          {({ height, width }) => (
            <CellMeasurer
              cellRenderer={this._renderLog}
              columnCount={1}
              rowCount={numRows}
              width={width}>
              {({ getRowHeight }) => (
                <Grid
                  ref={(ref) => { this._grid = ref; }}
                  columnCount={1}
                  columnWidth={width}
                  width={width}
                  height={height}
                  rowCount={numRows}
                  rowHeight={getRowHeight}
                  cellRenderer={this._renderLog}
                  style={Styles.logs}
                />
              )}
            </CellMeasurer>
          )}
        </AutoSizer>
      </div>
    );
    /* eslint-enable react/jsx-no-bind */
  }
}

const Styles = {
  container: {
    flex: '1 1 auto',
  },
  logs: {
    background: StyleConstants.colorDarkBackground,
    fontSize: StyleConstants.fontSizeMd,
  },
  logContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: StyleConstants.gutterLg,
    paddingRight: StyleConstants.gutterLg,
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
  loadingIndicator: {
    paddingLeft: StyleConstants.gutterLg,
    paddingTop: StyleConstants.gutterLg,
  },
};

const LOG_LEVEL_TO_STYLE = {
  [bunyan.DEBUG]: Styles.logDebug,
  [bunyan.INFO]: Styles.logDefault,
  [bunyan.WARN]: Styles.logWarning,
  [bunyan.ERROR]: Styles.logError,
};
