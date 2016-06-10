import React, {PropTypes} from 'react';

import StyleConstants from './StyleConstants';

export default class OptionGroup extends React.Component {
  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
      isSelected: PropTypes.bool,
      label: PropTypes.string.isRequired,
      onSelect: PropTypes.func.isRequired,
    })),
  };

  render() {
    return (
      <div>
        {this.props.options.map((option, index) => (
          <button onClick={option.onSelect}
            key={option.label}
            style={{
              border: 'none',
              background: 'transparent',
              color: option.isSelected ?
                StyleConstants.colorText : StyleConstants.colorSubtitle,
            }}>{option.label}</button>
        ))}
      </div>
    );
  }
}
