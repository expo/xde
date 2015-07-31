let React = require('react');

class ProcessInfo extends React.Component {
  render() {
    return (
      <div>
        <span>We are using io.js {process.version} and Electron {process.versions['electron']}</span>
      </div>
    );
  }
};

module.exports = ProcessInfo;
