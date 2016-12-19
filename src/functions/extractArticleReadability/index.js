import read from 'read-art'
import Promise from 'bluebird'
import S3 from '../../utils/s3'


const readPromise = url => new Promise((resolve, reject) => {
  read(url, (err, article, options) => {
    if (err) return reject(err)
    return resolve({ article, options })
  })
})


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
    const result = await readPromise(JSON.parse(data.Body).article, { output: 'text' })
    const article = {
      title: result.article.title,
      content: result.article.content
    }

    const fileName = `extractArticleReadability/out/${awsRequestId}.json`
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
