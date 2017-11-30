import { getAccountById } from '../../../dbAccounts/resolvers'
import service from '../../../../utils/service'
import { S3, SSM } from '../../../../utils/aws'

function getAccountCredentials(accountId, userId) {
  return getAccountById(accountId, userId)
    .then((account) => {
      if (!account || !account.key) {
        return Promise.reject(new Error('No Account attached'))
      }
      return SSM.getParameter({ Name: account.key }, true)
    })
    .then(res => JSON.parse(res.Parameter.Value))
}

function s3Output(inputData, { configParams, currentStep, userId }, logger) {
  const bucket = configParams.get('bucket')
  const path = configParams.get('path')
  const filename = configParams.get('filename')

  return getAccountCredentials(currentStep.account, userId)
    .then((credentialsParam) => {
      let credentials = credentialsParam

      if (typeof credentialsParam === 'string') {
        credentials = JSON.parse(credentials)
      }

      const s3 = S3(bucket, credentials)
      return s3.putObject({
        Key: `${filename}.json`,
        Body: JSON.stringify({ data: inputData }, null, 2)
      })
    })
    .then((res) => {
      logger.log(JSON.stringify(
        {
          bucket,
          path,
          filename,
          resuls: res
        },
        null,
        2
      ))
      return JSON.stringify(inputData, null, 2)
    })
}

export const handler = service(s3Output)
