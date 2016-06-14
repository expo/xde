import React, {PropTypes} from 'react';

import StyleConstants from './StyleConstants';

export default class ProjectIcon extends React.Component {
  static propTypes = {
    iconUrl: PropTypes.string,
  };

  render() {
    return this.props.iconUrl ?
      <img style={Styles.projectIcon} src={this.props.iconUrl} /> :
      <div style={Styles.placeholderIcon} />;
  }
}

const Styles = {
  placeholderIcon: {
    backgroundColor: StyleConstants.colorBorder,
    borderRadius: 5,
    display: 'inline-block',
    verticalAlign: 'middle',
    height: 25,
    width: 25,
  },
  projectIcon: {
    verticalAlign: 'middle',
    width: 25,
  },
};
