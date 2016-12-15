const Fs = require('fs')
const Promise = require('bluebird')
const AWS = require('./aws')
const fsUtil = require('../fsUtil')
const settings = require('../../settings')


const readFile = Promise.promisify(Fs.readFile)
const writeFile = Promise.promisify(Fs.writeFile)


/**
 * AWS SDK StepFunctions Wrapper to simplify the Workflow deployment
 */
class StepFunctions extends AWS {
  constructor(opts = {}) {
    super(opts)

    this._apiVersion = opts.apiVersion || settings.aws.stepFunctions.apiVersion
    this._roleArn = opts.roleArn || settings.aws.stepFunctions.arn
    this.AWS.config.apiVersions = {
      stepfunctions: this._apiVersion
    }

    this._stepFunctions = new this.AWS.StepFunctions()
  }


  _getWorkflowDefinition(workflow) {
    return readFile(fsUtil.getWorkflowPath(workflow))
      .then(res => JSON.parse(res))
  }


  createStateMachine(workflow) {
    return this._getWorkflowDefinition(workflow)
      .then(definition => this._stepFunctions.createStateMachine({
        definition: JSON.stringify(definition),
        name: workflow,
        roleArn: this._roleArn
      }).promise())
      .then(({ stateMachineArn }) => {
        return writeFile(fsUtil.getWorkflowArnPath(workflow), stateMachineArn)
      })
      .catch((err) => {
        console.log('[StepFunctions.createStateMachine] AWS Request failed', err)
        return Promise.reject(err)
      })
  }


  startExecution(workflow, data) {
    return readFile(fsUtil.getWorkflowArnPath(workflow), 'utf8')
      .then(arn => this._stepFunctions.startExecution({
        stateMachineArn: arn.replace('\n', ''),
        input: data
      }).promise())
      .then((res) => {
        console.log('[StepFunctions.startExecution]', res)
        return Promise.resolve(res)
      })
      .catch((err) => {
        console.log('[StepFunctions.startExecution] AWS Request failed', err)
        return Promise.reject(err)
      })
  }
}


module.exports = StepFunctions
