const path = require('path')
const baseConfig = require('./webpack.config.base')
const settings = require('../settings')


function createWebpackConfig(entry, bundleDirName, outputDir = settings.fs.dist.base) {
  return Object.assign({}, baseConfig, {
    entry: [
      'babel-polyfill',
      entry
    ],
    output: {
      path: path.join(outputDir, bundleDirName),
      filename: 'index.js',
      libraryTarget: 'commonjs2'
    }
  })
}


module.exports = createWebpackConfig
