const Fs = require('fs')
const Promise = require('bluebird')
const uuid = require('uuid')
const AWS = require('./aws')
const fsUtil = require('../fsUtil')
const settings = require('../../settings')


const readFile = Promise.promisify(Fs.readFile)


/**
 * AWS SDK StepFunctions Factory to simplify the Workflow deployment
 */
function StepFunctions() {
  AWS.config.apiVersions = { stepfunctions: settings.aws.stepFunctions.apiVersion }
  const { arn } = settings.aws.stepFunctions
  const stepFunctions = new AWS.StepFunctions()


  function getWorkflowDefinition(workflow) {
    return readFile(fsUtil.getWorkflowPath(workflow))
      .then(res => JSON.parse(res))
      .catch((err) => {
        console.log('[StepFunctions.getWorkflowDefinition]', err)
        return Promise.reject(err)
      })
  }


  function listDeployedStateMachines(workflow, params = {}) {
    return stepFunctions.listStateMachines(params).promise()
      .then((data) => {
        if (workflow) {
          return data.stateMachines.filter(sm => sm.name.indexOf(workflow) > -1)
        }
        return data.stateMachines
      })
      .catch((err) => {
        console.log('[StepFunctions.listDeployedStateMachines]', err)
        return Promise.reject(err)
      })
  }


  function deleteDeployedStateMachines(workflow) {
    return listDeployedStateMachines(workflow)
      .then((stateMachines) => {
        if (stateMachines.length <= 0) return Promise.resolve()
        const deletePromises = stateMachines.map(sm => stepFunctions.deleteStateMachine({
          stateMachineArn: sm.stateMachineArn
        }).promise())
        return Promise.all(deletePromises)
      })
      .catch((err) => {
        console.log('[StepFunctions.deleteDeployedStateMachines]', err)
        return Promise.reject(err)
      })
  }


  function deployStateMachine(workflow) {
    return getWorkflowDefinition(workflow)
      .then(definition => stepFunctions.createStateMachine({
        definition: JSON.stringify(definition),
        name: `${workflow}-${uuid.v1()}`,
        roleArn: arn
      }).promise())
      .catch((err) => {
        console.log('[StepFunctions.deployStateMachine] AWS Request failed', err)
        return Promise.reject(err)
      })
  }


  return {
    deploy: (workflow) => {
      return deleteDeployedStateMachines(workflow)
        .then(() => deployStateMachine(workflow))
    },

    deployAll: () => {
      const workflows = fsUtil.getAllWorkflows()
      return deleteDeployedStateMachines()
        .then(() => Promise.all(workflows.map(flow => deployStateMachine(flow))))
    },

    startExecution: (workflow, data) => {
      return listDeployedStateMachines(workflow)
        .then((stateMachines) => {
          const latestStateMachine = stateMachines.sort((a, b) => {
            const dateA = new Date(a.creationDate).getTime()
            const dateB = new Date(b.creationDate).getTime()
            return (dateB - dateA)
          })[0]

          return stepFunctions.startExecution({
            stateMachineArn: latestStateMachine.stateMachineArn,
            input: data
          }).promise()
        })
    }
  }
}


module.exports = StepFunctions()
