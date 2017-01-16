const path = require('path')
const baseConfig = require('./webpack.config.base')


function createWebpackConfig(entry, bundleDirName, outputDir) {
  return Object.assign({}, baseConfig, {
    entry: [
      'babel-polyfill',
      entry
    ],
    externals: {
      'aws-sdk': 'aws-sdk'
    },
    output: {
      path: path.join(outputDir, bundleDirName),
      filename: 'index.js',
      libraryTarget: 'commonjs2'
    }
  })
}


module.exports = createWebpackConfig
