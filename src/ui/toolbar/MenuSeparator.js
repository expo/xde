import React from 'react';

import StyleConstants from '../StyleConstants';

export default class MenuSeparator extends React.Component {
  render() {
    return <li style={Styles.separator} />;
  }
}

const Styles = {
  separator: {
    borderBottom: `1px solid ${StyleConstants.colorBorder}`,
    marginTop: StyleConstants.gutterSm,
    marginBottom: StyleConstants.gutterSm,
  },
};
