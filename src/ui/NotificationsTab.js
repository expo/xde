import React, { PropTypes } from 'react';
import { XDLState } from 'xdl';
import bunyan from 'bunyan';

import ConsoleLog from './ConsoleLog';
import StyleConstants from './StyleConstants';

const mapStateToProps = (state, props) => {
  return {
    notifications: props.projectRoot
      ? state.notifications[props.projectRoot]
      : null,
  };
};

class NotificationsTab extends React.Component {
  static propTypes = {
    projectRoot: PropTypes.string.isRequired,
    notifications: PropTypes.object,
  };

  render() {
    let { notifications } = this.props;

    let logs = [];

    if (notifications) {
      this._addLogsForArray(
        logs,
        notifications.error,
        bunyan.ERROR,
        'Error',
        StyleConstants.colorError
      );
      this._addLogsForArray(
        logs,
        notifications.warn,
        bunyan.WARN,
        'Warning',
        StyleConstants.colorWarning
      );
      this._addLogsForArray(logs, notifications.info, bunyan.INFO, 'Info');
    }

    if (logs.length === 0) {
      logs.push({
        level: bunyan.INFO,
        msg: 'No notifications right now!',
        leftMsg: '',
        hasVerticalPadding: true,
      });
    }

    return <ConsoleLog logs={logs} />;
  }

  _addLogsForArray = (logs, array, level, levelName, levelColor) => {
    for (let i = 0; i < array.length; i++) {
      let log = array[i];
      let logMessage = {
        level,
        msg: log.message,
        leftMsg: levelName,
        hasVerticalPadding: true,
      };
      if (levelColor) {
        logMessage.leftMsgColor = levelColor;
      }
      logs.push(logMessage);
    }
  };
}

export default XDLState.connect(mapStateToProps)(NotificationsTab);
