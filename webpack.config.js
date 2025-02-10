const path = require('path');

module.exports = {
  entry: './src/app.mjs',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  watchOptions: {
    ignored: [
      '**/node_modules',
      '**/.git',
      'C:/System Volume Information',
      'C:/pagefile.sys',
      'C:/swapfile.sys',
      'C:/hiberfil.sys',
      'C:/DumpStack.log.tmp'
    ]
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify")
    }
  }
};

  