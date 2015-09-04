let React = require('react');

let autobind = require('autobind-decorator');
let remote = require('remote');

let StyleConstants = require('./StyleConstants');


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
