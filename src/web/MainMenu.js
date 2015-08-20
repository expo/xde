let React = require('react');

let autobind = require('autobind-decorator');

let ProcessInfo = require('./ProcessInfo');
let StyleConstants = require('./StyleConstants');

class MainMenu extends React.Component {

  @autobind
  _renderHeader() {
    return (
      <div style={{
          marginBottom: 10,
      }}>
        <span style={styles.header}>
          <img src="./ExponentLogoBlue.png" style={{
            height: 16,
            width: 16,
            marginRight: 8,
            marginTop: 6,
            marginBottom: -2,
          }}/>
          <span>Exponent</span>
        </span>
      </div>
    );
  }

  @autobind
  _renderMenuItem(item) {
    return (
      <button style={styles.button} onClick={item.onClick}>{item.name}</button>
    );
  }

  @autobind
  _buttonClicked() {
    console.log("What difference does it make?");
  }

  render() {

    let menuItems = [

      {
        name: 'New Article',
        onClick: () => {
          console.log("New");
          require('remote').require('dialog').showOpenDialog({
            properties: ['openDirectory', 'createDirectory'],
          }, function (fileNames) {

            if (fileNames == null) {
              console.log("New article cancelled");
              return;
            }

            let fileName = fileNames[0];

            let env = {
              root: fileName,
            };

            let init = require('remote').require('./build/commands/init');
            init.runAsync(env, {}).then(() => {
              console.log("Successfully created a new project");
              let runPackager = require('remote').require('./build/commands/runPackager');
              runPackager.runAsync(env, {}).then(() => {
                console.log("Successfully started packager");

                // Close this window since we don't need it anymore
                require('remote').getCurrentWindow().close();

              }, (err) => {
                console.error("Failed to start packager");
                console.error(err);
                // TODO: Show an error message to the user
              });
            }, (err) => {
              console.error("Didn't initialize!");
              console.error(err.message);
              // TODO: Show an error message to the user
            });
          });

        },

      },

      {
        name: 'Open an Article',
        onClick: () => {
          console.log("Open");
          require('remote').require('dialog').showOpenDialog({
            properties: ['openDirectory'],
          }, (selections) => {

            if (!selections) {
              console.log("No directory selected");
              return;
            }

            let selection = selections[0];
            let env = {
              root: selection,
            };
            let runPackager = require('remote').require('./build/commands/runPackager');
            runPackager.runAsync(env, {}).then((pc) => {
              console.log("runAsync complete");
              let url = pc.getUrlAsync();
              console.log(url);
            });


          });
        },
      },

      {
        name: 'Quit',
        onClick: () => {
          console.log("Quit");
          require('remote').require('app').quit();
        },
      },

    ];

    return (
      <div style={styles.screen}>
        {this._renderHeader()}
        {menuItems.map(this._renderMenuItem)}
      </div>
    );

  }
}

module.exports = MainMenu;

let styles = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    margin: 20,
  },

  button: {
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'Verdana', 'sans-serif'],
    fontSize: 14,
    color: 'rgb(34, 34, 34)',
    fontWeight: 'bold',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgb(2, 46, 80)',
    borderStyle: 'solid',
    borderRadius: 4,
    padding: 12,
    margin: 12,
    cursor: 'pointer',
    touchAction: 'manipulation',
  },

  header: {
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'Verdana', 'sans-serif'],
    fontSize: 18,
    fontWeight: 200,
    letterSpacing: 4.5,
    // lineHeight: 20,
    paddingBottom: 12,
    textTransform: 'uppercase',
    color: StyleConstants.navy,
  },

  // _unused: {
  //   fontFamily: ['Whitney SSm A', 'Whitney SSm B', 'Helvetica', 'Arial', 'Sans-serif'],
  //   backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.34902))',
  //   backgroundImage: 'linear-gradient(rgb(93, 182, 232), rgb(22, 142, 218) 85%, rgb(22, 142, 218) 90%, rgb(29, 147, 221))',
  //   color: 'white',
  //   backgroundColor: '#888888',
  // },

};
