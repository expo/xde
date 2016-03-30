import React from 'react';

import StyleConstants from './StyleConstants';

class NewExperience extends React.Component {

  _renderInput(item) {
    return (
      <div>
        {item.label}
        <input type="text" />
      </div>
    );
  }

  render() {
    return (
      <div>

      </div>
    );
  }

}

module.exports = NewExperience;
