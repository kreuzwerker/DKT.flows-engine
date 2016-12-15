import extractor from 'unfluff'
import S3 from '../../utils/s3'

/*
 * Fetch an Article from given URL
 */
export async function handler(event, context, callback) {
  try {
    const { Key } = event
    const s3 = new S3()

    console.log(`Get '${Key}' from '${s3.Bucket}'`)
    const data = await s3.getObject({ Key })

    console.log('parsing and extracting data from article')
    const article = extractor(JSON.parse(data.Body).article)

    console.log('extracting article succeeded')
    callback(null, article)
  } catch (err) {
    console.log(err)
    callback(err)
  }
}
