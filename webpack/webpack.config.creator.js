const path = require('path')
const baseConfig = require('./webpack.config.base')
const settings = require('../settings')


function createWebpackConfig(
  entry,
  bundleDirName
) {
  return Object.assign({}, baseConfig, {
    entry: [
      'babel-polyfill',
      entry
    ],
    output: {
      path: path.join(settings.fs.dist.base, bundleDirName),
      filename: 'index.js',
      libraryTarget: 'commonjs2'
    }
  })
}


module.exports = createWebpackConfig
