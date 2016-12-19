const Fs = require('fs')
const Promise = require('bluebird')
const AWS = require('./aws')
const fsUtil = require('../fsUtil')
const settings = require('../../settings')


const readFile = Promise.promisify(Fs.readFile)
const writeFile = Promise.promisify(Fs.writeFile)


/**
 * AWS SDK StepFunctions Factory to simplify the Workflow deployment
 */
function StepFunctions() {
  const { apiVersion, arn } = settings.aws.stepFunctions

  AWS.config.apiVersions = { stepfunctions: apiVersion }

  const stepFunctions = new AWS.StepFunctions()


  const getWorkflowDefinition = (workflow) => {
    return readFile(fsUtil.getWorkflowPath(workflow))
      .then(res => JSON.parse(res))
  }


  return {
    createStateMachine: (workflow) => {
      return getWorkflowDefinition(workflow)
        .then(definition => stepFunctions.createStateMachine({
          definition: JSON.stringify(definition),
          name: workflow,
          roleArn: arn
        }).promise())
        .then(({ stateMachineArn }) => {
          return writeFile(fsUtil.getWorkflowArnPath(workflow), stateMachineArn)
        })
        .catch((err) => {
          console.log('[StepFunctions.createStateMachine] AWS Request failed', err)
          return Promise.reject(err)
        })
    },


    startExecution: (workflow, data) => {
      return readFile(fsUtil.getWorkflowArnPath(workflow), 'utf8')
        .then(stateMachineArn => stepFunctions.startExecution({
          stateMachineArn: stateMachineArn.replace('\n', ''),
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
}


module.exports = StepFunctions()
