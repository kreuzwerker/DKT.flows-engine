import read from 'read-art'
import Promise from 'bluebird'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import S3 from '../../../utils/s3'


const readPromise = url => new Promise((resolve, reject) => {
  read(url, (err, article, options) => {
    if (err) return reject(err)
    return resolve({ article, options })
  })
})


/*
 * Extract article text with 'readability'
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const s3 = S3(process.env.S3_BUCKET)

  try {
    const { Key } = _isString(event) ? JSON.parse(event) : event
    const { awsRequestId } = context

    logger.log(`Get '${Key}' from '${s3.bucket}'`)
    const data = await s3.getObject({ Key })

    logger.log('parsing and extracting data from article')
    const result = await readPromise(JSON.parse(data.Body).article, { output: 'text' })
    const article = {
      title: result.article.title,
      content: result.article.content
    }

    const fileName = `extractArticleReadability/out/${awsRequestId}.json`
    logger.log(`put extracted article '${fileName}' to '${s3.bucket}'`)
    const s3Response = await s3.putObject({
      Key: fileName,
      Body: JSON.stringify({ article })
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
