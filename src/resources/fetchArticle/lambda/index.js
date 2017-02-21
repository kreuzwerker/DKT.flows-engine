import fetch from 'node-fetch'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import S3 from '../../../utils/s3'


/*
 * Fetch an Article from given URL
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const s3 = S3(process.env.S3_BUCKET)

  try {
    const { url } = _isString(event) ? JSON.parse(event) : event
    const { awsRequestId } = context

    logger.log(`Try to fetch data from ${url}`)
    const result = await fetch(url)

    if (!result.ok) {
      throw new Error(`Failed fetching ${url} - ${result.status} ${result.statusText}`)
    }

    logger.log('Extract HTML')
    let articleHTML = await result.text()
    articleHTML = articleHTML.replace(/(\r\n|\n|\r|\t)/gm, '')

    const fileName = `fetchArticle/out/${awsRequestId}.json`

    logger.log(`Put '${fileName}' to '${s3.bucket}' Bucket`)
    const s3Response = await s3.putObject({
      Key: fileName,
      Body: JSON.stringify({ article: articleHTML })
    })

    const succeedResponse = Object.assign({}, s3Response, {
      Key: fileName
    })


    logger.log('Fetch Article succeeded')
    callback(null, JSON.stringify(succeedResponse))
  } catch (err) {
    callback(err)
  }
}
