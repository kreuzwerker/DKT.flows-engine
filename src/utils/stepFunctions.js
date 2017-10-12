/*
 * StepFunctions Utitlity which can be used in lambda functions
 */
import AWS from 'aws-sdk'
import settings from '../../settings'

function StepFunctions() {
  AWS.config.apiVersions = { stepfunctions: settings.aws.stepFunctions.apiVersion }
  const stepFunctions = new AWS.StepFunctions(settings.aws.stepFunctions)

  return {
    startExecution: (stateMachineArn, data) => {
      return stepFunctions
        .startExecution({
          stateMachineArn: stateMachineArn,
          input: data
        })
        .promise()
    },

    createStateMachine: (name, definition) => {
      return stepFunctions
        .createStateMachine({
          name,
          definition,
          roleArn: settings.aws.stepFunctions.arn
        })
        .promise()
    },

    deleteStateMachine: (stateMachineArn) => {
      return stepFunctions.deleteStateMachine({ stateMachineArn }).promise()
    },

    createActivity: (params) => {
      return stepFunctions.createActivity(params).promise()
    },

    deleteActivities: (activities) => {
      return Promise.all(
        activities.map((activity) => {
          const { activityArn } = activity
          return stepFunctions.deleteActivity({ activityArn }).promise()
        })
      )
    },

    getActivityTask: (params) => {
      return stepFunctions
        .getActivityTask(params)
        .promise()
        .then((res) => {
          return res
        })
    },

    sendTaskFailure: (params) => {
      return stepFunctions.sendTaskFailure(params).promise()
    },

    sendTaskSuccess: (params) => {
      return stepFunctions.sendTaskSuccess(params).promise()
    },

    deleteActivity: (params) => {
      return stepFunctions.deleteActivity(params).promise()
    }
  }
}

export default StepFunctions()
