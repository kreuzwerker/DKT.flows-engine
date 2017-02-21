import extractor from 'unfluff'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import S3 from '../../../utils/s3'

/*
 * Extract article Title
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const s3 = S3(process.env.S3_BUCKET)

  try {
    const { Key } = _isString(event) ? JSON.parse(event) : event
    const { awsRequestId } = context

    logger.log(`Get '${Key}' from '${s3.bucket}'`)
    const data = await s3.getObject({ Key })

    logger.log('parsing and extracting title from article')
    const article = extractor.lazy(JSON.parse(data.Body).article)
    const title = article.title()

    const fileName = `extractArticleTitle/out/${awsRequestId}.json`

    logger.log(`put extracted title '${fileName}' to '${s3.bucket}'`)
    const s3Response = await s3.putObject({
      Key: fileName,
      Body: JSON.stringify({ title })
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
