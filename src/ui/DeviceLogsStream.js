/* @flow */

import { ProjectUtils } from 'xdl';

export default class DeviceLogsStream {
  _projectRoot: string;
  _projectId: any;
  _getCurrentOpenProjectId: () => any;
  _handleDeviceLogs: () => any;

  constructor(
    {
      projectRoot,
      getCurrentOpenProjectId,
      handleDeviceLogs,
    }: {
      projectRoot: string,
      getCurrentOpenProjectId: () => any,
      handleDeviceLogs: () => void,
    }
  ) {
    this._projectId = getCurrentOpenProjectId();
    this._projectRoot = projectRoot;
    this._getCurrentOpenProjectId = getCurrentOpenProjectId;
    this._handleDeviceLogs = handleDeviceLogs;
    this._attachLoggerStream();
  }

  _attachLoggerStream() {
    ProjectUtils.attachLoggerStream(this._projectRoot, {
      stream: {
        write: chunk => {
          if (chunk.tag !== 'device') {
            return;
          } else if (this._getCurrentOpenProjectId() !== this._projectId) {
            // TODO: We should be confident that we are properly unsubscribing
            // from the stream rather than doing a defensive check like this.
            return;
          }

          this._handleDeviceLogs(chunk);
        },
      },
      type: 'raw',
    });
  }
}
