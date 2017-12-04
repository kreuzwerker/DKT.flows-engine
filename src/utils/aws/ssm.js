/**
 * SSM Utitlity
 */
import AWS from 'aws-sdk'
import settings from '../../../settings'

function SSM() {
  const ssm = new AWS.SSM(settings.aws.ssm)

  return {
    createParameterName: (stepId, fieldId) => `${stepId}_${fieldId}`,
    getParameter: (params, decrypt = false) =>
      ssm.getParameter({ ...params, WithDecryption: decrypt }).promise(),
    putParameter: params => ssm.putParameter({ ...params, Type: 'SecureString' }).promise(),
    deleteParameter: params => ssm.deleteParameter(params).promise()
  }
}

export default SSM()
