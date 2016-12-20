const _omit = require('lodash/omit')
const Fs = require('fs')
const Promise = require('bluebird')
const webpack = require('webpack')
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


  function buildPromiseCreator(lambdaFunc) {
    const functionPath = FsUtil.getFunctionPath(lambdaFunc)
    const webpackConfig = webpackConfigCreator(functionPath, lambdaFunc)
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


  return {
    build: lambdaFunc => buildPromiseCreator(lambdaFunc),

    buildAll: () => {
      const allFunctions = FsUtil.getAllFunctions()
      return Promise.all(allFunctions.map(func => buildPromiseCreator(func)))
    },

    deploy: (lambdaFunc, zipFileBase, publish = true) => {
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
  }
}


module.exports = Lambda()
