const Fs = require('fs')
const Path = require('path')
const Promise = require('bluebird')
const webpack = require('webpack')
const yazl = require('yazl')
const webpackConfigCreator = require('../../webpack/webpack.config.creator')
const AWS = require('./aws')
const FsUtil = require('../fsUtil')
const settings = require('../../settings')


const webpackPromise = Promise.promisify(webpack)
const readFile = Promise.promisify(Fs.readFile)


/**
 * AWS SDK Lambda Factory to simplify the Lambda function deployment
 */
function Lambda() {
  const { apiVersion, handler, arn, runtime, timeout } = settings.aws.lambda
  const lambda = new AWS.Lambda({ apiVersion })


  function buildLambda(functionName, outputDir = settings.fs.dist) {
    const functionPath = FsUtil.getLambdaPath(functionName)
    const webpackConfig = webpackConfigCreator(functionPath, functionName, outputDir)
    return webpackPromise(webpackConfig)
  }


  function getDeployedLambda(functionName) {
    return lambda.getFunction({ FunctionName: functionName }).promise()
  }


  function shouldUpdateOrCreate(functionName) {
    return getDeployedLambda(functionName)
      .then(() => ({ update: true }))
      .catch((err) => {
        if (err.statusCode === 404) {
          return ({ create: true })
        }
        return ({ error: err })
      })
  }


  function createNewLambda(functionName, zipFile, publish = true) {
    const args = {
      FunctionName: functionName,
      Runtime: runtime,
      Publish: publish,
      Code: {
        ZipFile: zipFile
      },
      Handler: handler,
      Timeout: timeout,
      Role: arn
    }

    return lambda.createFunction(args).promise()
      .catch((err) => {
        console.log('[Lambda.createNewLambda]', err)
        return Promise.reject(err)
      })
  }


  function updateDeployedLambda(functionName, zipFile, publish) {
    const updateCodeArgs = {
      FunctionName: functionName,
      Publish: publish,
      ZipFile: zipFile
    }
    const updateConfigArgs = {
      FunctionName: functionName,
      Timeout: timeout,
      Role: arn
    }

    return Promise.all([
      lambda.updateFunctionCode(updateCodeArgs).promise(),
      lambda.updateFunctionConfiguration(updateConfigArgs).promise()
    ])
      .catch((err) => {
        console.log('[Lambda.updateDeployedLambda]', err)
        return Promise.reject(err)
      })
  }


  function createZip(name, inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      const defaultHandler = settings.fs.lambdas.handler
      const zipFile = new yazl.ZipFile()
      const writeStream = Fs.createWriteStream(Path.join(outputPath, `${name}.zip`))
      const filePath = Path.join(inputPath, name, defaultHandler)

      zipFile.addFile(filePath, defaultHandler)
      zipFile.outputStream.pipe(writeStream)
      zipFile.outputStream.on('error', err => reject(err))
      zipFile.end()
      writeStream.on('close', () => resolve())
      writeStream.on('error', err => reject(err))
    })
  }


  function deployLambda(functionName, zipFileBase, publish = true) {
    const merge = (...args) => Object.assign({}, ...args)

    return readFile(`${zipFileBase}/${functionName}.zip`)
      .then(zipFile => shouldUpdateOrCreate(functionName).then(res => merge(res, { zipFile })))
      .then((res) => {
        if (res.create) {
          return createNewLambda(functionName, res.zipFile, publish)
        } else if (res.update) {
          return updateDeployedLambda(functionName, res.zipFile, publish)
        }
        return Promise.reject(res.error || res)
      })
  }


  return {
    build: (functionName, outputDir) => buildLambda(functionName, outputDir),

    buildAll: (outputDir) => {
      const allFunctions = FsUtil.getAllLambdas()
      return Promise.all(allFunctions.map(func => buildLambda(func, outputDir)))
    },

    bundle: (functionName, inputDir, outputDir) => createZip(functionName, inputDir, outputDir),

    bundleAll: (inputDir, outputDir) => {
      const allFunctions = FsUtil.getAllLambdas()
      return Promise.all(allFunctions.map(func => createZip(func, inputDir, outputDir)))
    },

    deploy: (functionName, zipFileBase, publish = true) => {
      return deployLambda(functionName, zipFileBase, publish)
    },

    deployAll: (zipFileBase, publish = true) => {
      const allFunctions = FsUtil.getAllLambdaZips()
      return Promise.all(allFunctions.map(func => deployLambda(func, zipFileBase, publish)))
    }
  }
}


module.exports = Lambda()
