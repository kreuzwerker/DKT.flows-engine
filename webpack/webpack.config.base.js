const webpack = require('webpack')

module.exports = {
  devtool: 'source-map',
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
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: true,
      beautify: true,
      mangle: true,
      output: {
        comments: false
      }
    })
  ]
}
