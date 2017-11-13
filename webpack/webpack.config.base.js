const webpack = require('webpack')
const MinifyPlugin = require('babel-minify-webpack-plugin')

module.exports = {
  devtool: 'none',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.LoaderOptionsPlugin({ minimize: true }),
    new MinifyPlugin()
  ]
}
