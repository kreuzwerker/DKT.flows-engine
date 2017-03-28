const Fs = require('fs')
const Path = require('path')
const Promise = require('bluebird')
const webpack = require('webpack')
const yazl = require('yazl')
const webpackConfigCreator = require('../../webpack/webpack.config.creator')
const FsUtil = require('../fsUtil')
const settings = require('../../settings')


const webpackPromise = Promise.promisify(webpack)
const defaultOutput = settings.fs.dist.resources

/**
 * Lambda Module to simplify common lambda tasks like building, bundling, ...
 */
module.exports = {
  build: (fn, outputDir = defaultOutput) => {
    const fnPath = FsUtil.getLambdaPath(fn)
    const fnName = fn.replace('services/', '')
    const webpackConfig = webpackConfigCreator(fnPath, fnName, outputDir)

    return webpackPromise(webpackConfig).then((stats) => {
      if (stats.hasErrors()) {
        return Promise.reject(stats.toString('errors-only'))
      }
      return Promise.resolve(fnName)
    })
  },

  bundle: (fnName, inputDir, outputDir = defaultOutput) => new Promise((resolve, reject) => {
    const defaultHandler = settings.fs.lambdas.handler
    const zipFile = new yazl.ZipFile()
    const dest = Path.join(outputDir, `${fnName}.zip`)
    const writeStream = Fs.createWriteStream(dest)
    const filePath = Path.join(inputDir, fnName, defaultHandler)

    zipFile.addFile(filePath, defaultHandler)
    zipFile.outputStream.pipe(writeStream)
    zipFile.outputStream.on('error', err => reject(err))
    zipFile.end()
    writeStream.on('close', () => resolve({ fnName, bundlePath: dest }))
    writeStream.on('error', err => reject(err))
  })
}
