import fetch from 'node-fetch'
import uuid from 'uuid'
import S3 from '../../utils/s3'


/*
 * Fetch an Article from given URL
 */
export async function handler(event, context, callback) {
  try {
    const { url } = event
    const { awsRequestId } = context
    const s3 = new S3()

    console.log(`Try to fetch data from ${url}`)
    const result = await fetch(url)

    if (!result.ok) {
      throw new Error(`Failed fetching ${url} - ${result.status} ${result.statusText}`)
    }

    console.log('Extract HTML')
    let articleHTML = await result.text()
    articleHTML = articleHTML.replace(/(\r\n|\n|\r|\t)/gm, '')

    const fileName = `fetchArticle/${awsRequestId}.json`

    console.log(`Put '${fileName}' to '${s3.bucket}' Bucket`)
    const s3Response = await s3.putObject({
      Key: fileName,
      Body: JSON.stringify({ article: articleHTML })
    })

    const succeedResponse = Object.assign({}, s3Response, {
      Key: fileName
    })


    console.log('Fetch Article succeeded')
    callback(null, JSON.stringify(succeedResponse))
  } catch (err) {
    callback(err)
  }
}
