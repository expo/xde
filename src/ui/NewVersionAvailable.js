import React from "react";
import { shell } from "electron";

import Notification from "./Notification";

const XDE_SUNSET_TIME = 1540339200000;

export default class NewVersionAvailable extends React.Component {
  handleClick = () => {
    shell.openExternal(
      "https://blog.expo.io/expo-cli-2-0-released-a7a9c250e99c"
    );
  };

  render() {
    if (new Date().getTime() < XDE_SUNSET_TIME) {
      return (
        <Notification
          onClick={this.handleClick}
          type="warning"
          message="XDE is deprecated and will stop receiving updates on October 24th 2018. Please switch to Expo Dev Tools. Click to read more…"
        />
      );
    } else {
      return (
        <Notification
          onClick={this.handleClick}
          type="error"
          message="XDE is not supported anymore. Please switch to Expo Dev Tools. Click to read more…"
        />
      );
    }
  }
}
