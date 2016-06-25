import React from 'react';

import StyleConstants from '../StyleConstants';

export default class MenuSeparator extends React.Component {
  render() {
    return <div style={Styles.separator} />;
  }
}

const Styles = {
  separator: {
    borderBottom: `1px solid ${StyleConstants.colorBorder}`,
    marginTop: StyleConstants.gutterMd,
    marginBottom: StyleConstants.gutterMd,
  },
};
