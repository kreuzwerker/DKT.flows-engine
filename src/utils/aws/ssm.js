/**
 * SSM Utitlity
 */
import AWS from 'aws-sdk'
import settings from '../../../settings'

function SSM() {
  const ssm = new AWS.SSM(settings.aws.ssm)

  return {
    getParameter: params => ssm.getParameter(params).promise(),
    putParameter: params => ssm.putParameter({ ...params, Type: 'SecureString' }).promise()
  }
}

export default SSM()
