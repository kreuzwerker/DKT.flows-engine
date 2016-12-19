import extractor from 'unfluff'
import S3 from '../../utils/s3'


/*
 * Extract article
 */
export async function handler(event, context, callback) {
  try {
    const { Key } = JSON.parse(event)
    const { awsRequestId } = context

    console.log(`Get '${Key}' from '${S3.bucket}'`)
    const data = await S3.getObject({ Key })

    console.log('parsing and extracting data from article')
    const article = extractor(JSON.parse(data.Body).article)

    const fileName = `extractArticleUnfluff/out/${awsRequestId}.json`

    console.log(`put extracted article '${fileName}' to '${S3.bucket}'`)
    const s3Response = await S3.putObject({
      Key: fileName,
      Body: JSON.stringify({ article })
    })

    const succeedResponse = Object.assign({}, s3Response, {
      Key: fileName
    })

    callback(null, JSON.stringify(succeedResponse))
  } catch (err) {
    console.log(err)
    callback(err)
  }
}
