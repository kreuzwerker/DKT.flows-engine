import uuid from 'uuid'
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

// TODO this only counts up to 1000. when going in production we need to improve the counting function
function countFile(bucket, filename, s3) {
  return s3
    .listObjects({
      Bucket: bucket,
      Prefix: filename
    })
    .then((res) => {
      const count = res.Contents.length || 0
      return count
    })
    .catch((err) => {
      console.log('listObjectsErr', err)
      return Promise.reject(err)
    })
}

function createUniqueFilename(appendixType, bucket, filename, s3) {
  if (appendixType === 'count') {
    return countFile(bucket, filename, s3).then(count => `${filename}-${count}`)
  }

  return Promise.resolve(`${filename}-${uuid.v4()}`)
}

async function s3Output(inputData, { configParams, currentStep, userId }, logger) {
  const bucket = configParams.get('bucket')
  const path = configParams.get('path')
  const filename = configParams.get('filename')
  const appendixType = configParams.get('appendix')
  let credentials = null,
      uniqueFilename = ''

  try {
    credentials = await getAccountCredentials(currentStep.account, userId)
  } catch (e) {
    return Promise.reject(e)
  }

  if (typeof credentials === 'string') {
    credentials = JSON.parse(credentials)
  }

  const s3 = S3(bucket, credentials)

  try {
    uniqueFilename = await createUniqueFilename(appendixType, bucket, filename, s3)
  } catch (e) {
    return Promise.reject(e)
  }

  try {
    const result = await s3.putObject({
      Key: `${uniqueFilename}.json`,
      Body: JSON.stringify({ data: inputData }, null, 2)
    })

    logger.log(JSON.stringify(
      {
        bucket,
        path,
        filename,
        result
      },
      null,
      2
    ))
  } catch (e) {
    return Promise.reject(e)
  }

  return JSON.stringify(inputData, null, 2)
}

export const handler = service(s3Output)
