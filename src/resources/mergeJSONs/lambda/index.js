import _isString from 'lodash/isString'
import S3 from '../../../utils/s3'
import Logger from '../../../utils/logger'


const getObjects = keys => Promise.all(keys.map((Key) => {
  return S3.getObject({ Key })
    .then(res => res.Body.toString())
    .then(jsonString => JSON.parse(jsonString))
}))


/*
 * Merge JSONs from given S3 paths
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)

  try {
    const { awsRequestId } = context
    const input = _isString(event) ? JSON.parse(event) : event
    const keys = input.map(i => (_isString(i) ? JSON.parse(i).Key : i.Key))

    logger.log(`Get JSONs from '${S3.bucket}'`)
    const jsons = await getObjects(keys)

    logger.log('Merge JSONs')
    const mergedJSONs = jsons.reduce((a, b) => Object.assign({}, a, b), {})

    const fileName = `mergeJSONs/out/${awsRequestId}.json`

    logger.log(`Put merged JSON '${fileName}' to '${S3.bucket}'`)
    const s3Response = await S3.putObject({
      Key: fileName,
      Body: JSON.stringify(mergedJSONs)
    })

    const succeedResponse = Object.assign({}, s3Response, {
      Key: fileName
    })

    callback(null, JSON.stringify(succeedResponse))
  } catch (err) {
    logger.log(err)
    callback(err)
  }
}
