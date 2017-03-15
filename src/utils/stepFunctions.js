/*
 * StepFunctions Utitlity which can be used in lambda functions
 */
import AWS from 'aws-sdk'
import settings from '../../settings'


function StepFunctions() {
  AWS.config.apiVersions = { stepfunctions: settings.aws.stepFunctions.apiVersion }
  const stepFunctions = new AWS.StepFunctions()


  async function getLatestStateMachine(workflow, params = {}) {
    try {
      const data = await stepFunctions.listStateMachines(params).promise()
      const stateMachines = data.stateMachines.filter(sm => sm.name.indexOf(workflow) > -1)

      return stateMachines.sort((a, b) => {
        const dateA = new Date(a.creationDate).getTime()
        const dateB = new Date(b.creationDate).getTime()
        return (dateB - dateA)
      })[0]
    } catch (err) {
      return Promise.reject(err)
    }
  }


  return {
    startExecution: async (workflow, data) => {
      try {
        const stateMachine = await getLatestStateMachine(workflow)
        return stepFunctions.startExecution({
          stateMachineArn: stateMachine.stateMachineArn,
          input: data
        }).promise()
      } catch (err) {
        return Promise.reject(err)
      }
    },

    createStateMachine: (name, definition) => {
      return stepFunctions.createStateMachine({
        name, definition,
        roleArn: settings.aws.stepFunctions.arn
      }).promise()
    }
  }
}


export default StepFunctions()
