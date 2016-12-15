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
 * AWS SDK Lambda Wrapper to simplify the Lambda function deployment
 */
class Lambda extends AWS {
  constructor(opts = {}) {
    super(opts)

    this._apiVersion = opts.apiVersion || settings.aws.lambda.apiVersion
    this._handler = opts.handler || settings.aws.lambda.handler
    this._roleArn = opts.arn || settings.aws.lambda.arn
    this._runtime = opts.runtime || settings.aws.lambda.runtime
    this._timeout = opts.timeout || settings.aws.lambda.timeout
    this._lambda = new this.AWS.Lambda({
      apiVersion: this._apiVersion
    })
  }


  _getFunction(params) {
    return this._lambda.getFunction(params).promise()
  }


  _createFunction(params) {
    const create = (data) => {
      const args = Object.assign({}, _omit(params, 'ZipFile'), {
        Runtime: params.Runtime || this._runtime,
        Publish: params.Publish || true,
        Code: {
          ZipFile: data
        },
        Handler: this._handler,
        Timeout: this._timeout,
        Role: this._roleArn
      })
      return this._lambda.createFunction(args).promise()
    }

    return readFile(params.ZipFile)
      .then(data => create(data))
      .catch((err) => {
        console.log('[Lambda.createFunction]', err)
        return Promise.reject(err)
      })
  }


  _updateFunction(params) {
    const update = (data) => {
      const updateCodeArgs = {
        FunctionName: params.FunctionName,
        Publish: params.Publish || true,
        ZipFile: data
      }

      const updateConfigArgs = _omit(params, ['ZipFile', 'Publish'])
      updateConfigArgs.Timeout = updateConfigArgs.Timeout || this._timeout
      updateConfigArgs.Role = updateConfigArgs.Role || this._roleArn

      return Promise.all([
        this._lambda.updateFunctionCode(updateCodeArgs).promise(),
        this._lambda.updateFunctionConfiguration(updateConfigArgs).promise()
      ])
    }

    return readFile(params.ZipFile)
      .then(data => update(data))
      .catch((err) => {
        console.log('[Lambda.updateFunction]', err)
        return Promise.reject(err)
      })
  }


  build(lambdaFunc) {
    const functionPath = FsUtil.getFunctionPath(lambdaFunc)
    const webpackConfig = webpackConfigCreator(functionPath, lambdaFunc)
    return webpackPromise(webpackConfig)
  }


  buildAll() {
    const allFunctions = FsUtil.getAllFunctions()
    return Promise.all(allFunctions.map(func => this.build(func)))
  }


  deploy(params) {
    return this._getFunction({ FunctionName: params.FunctionName })
      .then(() => this._updateFunction(params)) // update when function already exists
      .catch((err) => {
        if (err.statusCode === 404) {
          return this._createFunction(params) // create when function not exists
        }
        console.log('[Lambda.deploy] AWS Request failed', err)
        return Promise.reject(err)
      })
  }
}


module.exports = Lambda
