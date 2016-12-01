// Native
const path = require('path');

// Packages
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const getenv = require('getenv');

const outputPath = path.join(__dirname, 'app', 'build');
const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = env => {
  let babelConfig = {
    cacheDirectory: true,
    babelrc: false,
    presets: ['es2017', 'stage-1', 'react'],
    plugins: [
      'flow-react-proptypes',
      'transform-es2015-destructuring',
      'transform-es2015-parameters',
      'transform-class-properties',
      'transform-decorators-legacy',
      'transform-runtime',
    ],
  };

  if (env.prod) {
    babelConfig = Object.assign({}, babelConfig, {
      presets: [...babelConfig.presets, 'react-optimize'],
      passPerPreset: true,
      compact: true,
      comments: false,
    });
  } else if (env.hmr) {
    babelConfig = Object.assign({}, babelConfig, {
      presets: ['es2017', 'stage-1', 'react'],
      plugins: [
        'react-hot-loader/babel',
        'flow-react-proptypes',
        'transform-decorators-legacy',
        'transform-class-properties',
        'transform-es2015-classes',
        'transform-es2015-destructuring',
        'transform-es2015-parameters',
        'transform-runtime',
      ],
    });
  }

  const moduleConfig = {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: babelConfig,
        }],
      },
      {
        test: /\.json/,
        loader: 'json',
      },
    ],
  };

  const commonPlugins = [
    new webpack.BannerPlugin({
      banner: 'process.env.NODE_ENV = ' + JSON.stringify(getenv.string('NODE_ENV', 'development')) + ';',
      raw: true,
      entryOnly: false,
    }),
    //prints more readable module names in the browser console on HMR updates
    new webpack.NamedModulesPlugin(),
  ];

  const config = [
    {
      name: 'renderer',
      entry: './src/renderer.js',
      target: 'electron-renderer',
      output: {
        path: outputPath,
        filename: 'renderer.js',
      },
      node: {
        __dirname: false,
        __filename: false,
        process: false,
        Buffer: false,
        setImmediate: false,
      },
      externals: [
        nodeExternals({
          modulesDir: './app/node_modules',
        }),
      ],
      devtool: env.dev ? 'eval' : 'source-map',
      module: moduleConfig,
      resolve: {
        extensions: [
          '.svg',
          '.js',
          '.jsx',
          '.json',
        ],
      },
      plugins: [
        ...commonPlugins,
      ],
    },
    {
      name: 'electron',
      entry: './src/main.js',
      target: 'electron-main',
      output: {
        path: outputPath,
        filename: 'main.js',
      },
      node: {
        __dirname: false,
        __filename: false,
        process: false,
        Buffer: false,
        setImmediate: false,
      },
      externals(context, request, callback) {
        callback(null, request.startsWith('.') ? false : `require('${request}')`);
      },
      devtool: env.dev ? 'inline-source-map' : 'source-map',
      resolve: {
        modules: [
          'node_modules',
        ],
      },
      module: moduleConfig,
      plugins: [
        new webpack.BannerPlugin({
          banner: 'require(\"source-map-support\").install();',
          raw: true,
          entryOnly: false,
        }),
        ...commonPlugins,
      ],
    },
  ];

  // Hot Loading
  if (env.hmr) {
    const devServerPort = getenv.int('DEVSERVER_PORT', 8282);

    let rendererConfig = config[0];
    rendererConfig.entry = [
      'react-hot-loader/patch',
      config[0].entry,
    ];

    rendererConfig.output = Object.assign({}, rendererConfig.output, {
      publicPath: `http://localhost:${devServerPort}/`,
    });

    rendererConfig.devServer = {
      //activate hot reloading
      hot: true,
      //match the output path
      contentBase: outputPath,
      //match the output publicPath
      publicPath: '/',
      // dev server port
      port: devServerPort,
    };

    rendererConfig.plugins = [
      //activates HMR
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      ...rendererConfig.plugins,
    ];

    config[0] = rendererConfig;
  }

  // Prod Setup
  if (env.prod) {
    // Stubbed here for future prod customizations

    const rendererConfig = config[0];
    const mainConfig = config[1];

    rendererConfig.plugins = [
      ...rendererConfig.plugins,
    ];

    mainConfig.plugins = [
      ...mainConfig.plugins,
    ];

    config[0] = rendererConfig;
    config[1] = mainConfig;
  }

  return config;
};
