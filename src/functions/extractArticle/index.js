import extractor from 'unfluff'
import S3 from '../../utils/s3'


/*
 * Fetch an Article from given URL
 */
export async function handler(event, context, callback) {
  try {
    const { Key } = event

    console.log(`Get '${Key}' from '${S3.bucket}'`)
    const data = await S3.getObject({ Key })

    console.log('parsing and extracting data from article')
    const article = extractor(JSON.parse(data.Body).article)

    console.log('extracting article succeeded')
    callback(null, article)
  } catch (err) {
    console.log(err)
    callback(err)
  }
}
