let React = require('react');

let MainMenu = require('./MainMenu');
let NgrokPanel = require('./NgrokPanel');


class App extends React.Component {
  render() {
    return <NgrokPanel />;
  }
};

module.exports = App;
