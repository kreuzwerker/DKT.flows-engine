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


  function buildFunction(lambdaFunc, outputDir = settings.fs.dist) {
    const functionPath = FsUtil.getFunctionPath(lambdaFunc)
    const webpackConfig = webpackConfigCreator(functionPath, lambdaFunc, outputDir)
    return webpackPromise(webpackConfig)
  }


  function getDeployedFunction(lambdaFunc) {
    return lambda.getFunction({ FunctionName: lambdaFunc }).promise()
  }


  function shouldUpdateOrCreate(lambdaFunc) {
    return getDeployedFunction(lambdaFunc)
      .then(() => ({ update: true }))
      .catch((err) => {
        if (err.statusCode === 404) {
          return ({ create: true })
        }
        return ({ error: err })
      })
  }


  function createNewFunction(lambdaFunc, zipFile, publish = true) {
    const args = {
      FunctionName: lambdaFunc,
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
        console.log('[Lambda.createNewFunction]', err)
        return Promise.reject(err)
      })
  }


  function updateDeployedFunction(lambdaFunc, zipFile, publish) {
    const updateCodeArgs = {
      FunctionName: lambdaFunc,
      Publish: publish,
      ZipFile: zipFile
    }
    const updateConfigArgs = {
      FunctionName: lambdaFunc,
      Timeout: timeout,
      Role: arn
    }

    return Promise.all([
      lambda.updateFunctionCode(updateCodeArgs).promise(),
      lambda.updateFunctionConfiguration(updateConfigArgs).promise()
    ])
      .catch((err) => {
        console.log('[Lambda.updateDeployedFunction]', err)
        return Promise.reject(err)
      })
  }


  function zipFunctionPromise(name, inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      const defaultHandler = settings.fs.functions.handler
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


  function deployLambdaFunction(lambdaFunc, zipFileBase, publish = true) {
    const merge = (...args) => Object.assign({}, ...args)

    return readFile(`${zipFileBase}/${lambdaFunc}.zip`)
      .then(zipFile => shouldUpdateOrCreate(lambdaFunc).then(res => merge(res, { zipFile })))
      .then((res) => {
        if (res.create) {
          return createNewFunction(lambdaFunc, res.zipFile, publish)
        } else if (res.update) {
          return updateDeployedFunction(lambdaFunc, res.zipFile, publish)
        }
        return Promise.reject(res.error || res)
      })
  }


  return {
    build: (lambdaFunc, outputDir) => buildFunction(lambdaFunc, outputDir),

    buildAll: (outputDir) => {
      const allFunctions = FsUtil.getAllFunctions()
      return Promise.all(allFunctions.map(func => buildFunction(func, outputDir)))
    },

    bundle: (lambdaFunc, inputDir, outputDir) => zipFunctionPromise(lambdaFunc, inputDir, outputDir),

    bundleAll: (inputDir, outputDir) => {
      const allFunctions = FsUtil.getAllFunctions()
      return Promise.all(allFunctions.map(func => zipFunctionPromise(func, inputDir, outputDir)))
    },

    deploy: (lambdaFunc, zipFileBase, publish = true) => {
      return deployLambdaFunction(lambdaFunc, zipFileBase, publish)
    },

    deployAll: (zipFileBase, publish = true) => {
      const allFunctions = FsUtil.getAllFunctionsZips()
      return Promise.all(allFunctions.map(func => deployLambdaFunction(func, zipFileBase, publish)))
    }
  }
}


module.exports = Lambda()
