import React, {PropTypes} from 'react';

import StyleConstants from './StyleConstants';

export default class ProjectIcon extends React.Component {
  static propTypes = {
    iconUrl: PropTypes.string,
    size: PropTypes.number,
  };

  static defaultProps = {
    size: 25,
  };

  render() {
    const sizeStyle = {
      width: this.props.size,
      height: this.props.size,
    };
    return this.props.iconUrl ?
      <img style={{...Styles.projectIcon, ...sizeStyle}}
        src={this.props.iconUrl}
      /> :
      <div style={{...Styles.placeholderIcon, ...sizeStyle}} />;
  }
}

const Styles = {
  placeholderIcon: {
    backgroundColor: StyleConstants.colorBorder,
    borderRadius: 5,
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  projectIcon: {
    verticalAlign: 'middle',
  },
};
