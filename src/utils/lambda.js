/*
 * Lambda Utitlity which can be used in lambda functions
 */
import AWS from 'aws-sdk'
import settings from '../../settings'


function Lambda() {
  const { apiVersion } = settings.aws.lambda
  const lambda = new AWS.Lambda({ apiVersion })

  return {
    invoke: params => lambda.invoke(params).promise(),
    listFunctions: params => lambda.listFunctions(params).promise(),
    getFunction: params => lambda.getFunction(params).promise()
  }
}


export default Lambda()
