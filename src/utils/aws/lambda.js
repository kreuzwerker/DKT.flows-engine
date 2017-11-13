/*
 * Lambda Utitlity which can be used in lambda functions
 */
import AWS from 'aws-sdk'
import settings from '../../../settings'

function Lambda() {
  const { apiVersion } = settings.aws.lambda
  const lambda = new AWS.Lambda(settings.aws.lambda)

  return {
    invoke: params => lambda.invoke(params).promise(),
    listFunctions: params => lambda.listFunctions(params).promise(),
    getFunction: params => lambda.getFunction(params).promise(),
    addPermission: params => lambda.addPermission(params).promise(),
    removePermission: params => lambda.removePermission(params).promise()
  }
}

export default Lambda()
