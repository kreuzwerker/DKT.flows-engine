import extractor from 'unfluff'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import S3 from '../../../utils/s3'


/*
 * Extract article text with node unfluff
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)

  try {
    const { Key } = _isString(event) ? JSON.parse(event) : event
    const { awsRequestId } = context

    logger.log(`Get '${Key}' from '${S3.bucket}'`)
    const data = await S3.getObject({ Key })

    logger.log('parsing and extracting text from article')
    const article = extractor.lazy(JSON.parse(data.Body).article)
    const text = article.text()

    const fileName = `extractArticleText/out/${awsRequestId}.json`

    logger.log(`put extracted text '${fileName}' to '${S3.bucket}'`)
    const s3Response = await S3.putObject({
      Key: fileName,
      Body: JSON.stringify({ text })
    })

    const succeedResponse = Object.assign({}, s3Response, {
      Key: fileName
    })

    context.succeed(JSON.stringify(succeedResponse))
  } catch (err) {
    logger.log(err)
    context.fail(err)
  }
}
