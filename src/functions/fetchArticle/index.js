import fetch from 'node-fetch'
import uuid from 'uuid'
import S3 from '../../utils/s3'


/*
 * Fetch an Article from given URL
 */
export async function handler(event, context, callback) {
  try {
    const { url } = event
    const s3 = new S3()

    console.log(`Try to fetch data from ${url}`)
    const result = await fetch(url)

    if (!result.ok) {
      throw new Error(`Failed fetching ${url} - ${result.status} ${result.statusText}`)
    }

    console.log('Extract HTML')
    let articleHTML = await result.text()
    articleHTML = articleHTML.replace(/(\r\n|\n|\r|\t)/gm, '')

    const articleFileName = `fetchArticle/${uuid.v4()}.json`

    console.log(`Put '${articleFileName}' to '${s3.bucket}' Bucket`)
    const s3Response = await s3.putObject({
      Key: articleFileName,
      Body: JSON.stringify({ article: articleHTML })
    })

    console.log('Fetch Article succeeded')
    const succeedResponse = Object.assign({}, s3Response, {
      Key: articleFileName
    })

    callback(null, JSON.stringify(succeedResponse))
  } catch (err) {
    callback(err)
  }
}
