import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

import StyleConstants from './StyleConstants';

export default class ConsoleLog extends React.Component {
  static propTypes = {
    logs: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf([
        'default', 'error', 'meta', 'metaError', 'metaWarning',
      ]),
      message: PropTypes.string,
    })),
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
    let logStyle;
    switch (log.type) {
      case 'error':
        logStyle = Styles.logError; break;
      case 'meta':
        logStyle = Styles.logMeta; break;
      case 'metaError':
        logStyle = Styles.logMetaError; break;
      case 'metaWarning':
        logStyle = Styles.logMetaWarning; break;
      default:
        logStyle = Styles.logDefault; break;
    }
    return (
      <pre key={index} style={{...Styles.log, ...logStyle}}>{log.message}</pre>
    );
  }

  render() {
    return (
      <div style={Styles.logs}>
        {this.props.logs.map((log, index) => this._renderLog(log, index))}
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
  },
  log: {
    background: StyleConstants.colorDarkBackground,
    whiteSpace: 'pre-wrap',
  },
  logDefault: {
    color: 'white',
  },
  logError: {
    color: StyleConstants.colorError,
  },
  logMeta: {
    color: StyleConstants.colorSubtitle,
  },
  logMetaError: {
    color: StyleConstants.colorError,
  },
};
