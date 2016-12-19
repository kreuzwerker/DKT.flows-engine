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


  const getFunction = params => lambda.getFunction(params).promise()


  const createFunction = (params) => {
    const create = (data) => {
      const args = Object.assign({}, _omit(params, 'ZipFile'), {
        Runtime: params.Runtime || runtime,
        Publish: params.Publish || true,
        Code: {
          ZipFile: data
        },
        Handler: handler,
        Timeout: timeout,
        Role: arn
      })
      return lambda.createFunction(args).promise()
    }

    return readFile(params.ZipFile)
      .then(data => create(data))
      .catch((err) => {
        console.log('[Lambda.createFunction]', err)
        return Promise.reject(err)
      })
  }


  const updateFunction = (params) => {
    const update = (data) => {
      const updateCodeArgs = {
        FunctionName: params.FunctionName,
        Publish: params.Publish || true,
        ZipFile: data
      }

      const updateConfigArgs = _omit(params, ['ZipFile', 'Publish'])
      updateConfigArgs.Timeout = updateConfigArgs.Timeout || timeout
      updateConfigArgs.Role = updateConfigArgs.Role || arn

      return Promise.all([
        lambda.updateFunctionCode(updateCodeArgs).promise(),
        lambda.updateFunctionConfiguration(updateConfigArgs).promise()
      ])
    }

    return readFile(params.ZipFile)
      .then(data => update(data))
      .catch((err) => {
        console.log('[Lambda.updateFunction]', err)
        return Promise.reject(err)
      })
  }


  const build = (lambdaFunc) => {
    const functionPath = FsUtil.getFunctionPath(lambdaFunc)
    const webpackConfig = webpackConfigCreator(functionPath, lambdaFunc)
    return webpackPromise(webpackConfig)
  }


  const buildAll = () => {
    const allFunctions = FsUtil.getAllFunctions()
    return Promise.all(allFunctions.map(func => build(func)))
  }


  const deploy = (params) => {
    return getFunction({ FunctionName: params.FunctionName })
      .then(() => updateFunction(params)) // update when function already exists
      .catch((err) => {
        if (err.statusCode === 404) {
          return createFunction(params) // create when function not exists
        }
        console.log('[Lambda.deploy] AWS Request failed', err)
        return Promise.reject(err)
      })
  }

  return { build, buildAll, deploy }
}


module.exports = Lambda()
