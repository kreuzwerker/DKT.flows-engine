import fetch from 'node-fetch'
import _isString from 'lodash/isString'
import Logger from '../../../../utils/logger'
import S3 from '../../../../utils/s3'

/*
 * Fetch an Article from given URL
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const { NLP_URL, S3_BUCKET } = process.env
  const s3 = S3(S3_BUCKET)

  try {
    const { Key } = _isString(event) ? JSON.parse(event) : event
    const { awsRequestId } = context

    logger.log(`Get '${Key}' from '${s3.bucket}'`)

    const data = await s3.getObject({ Key })
    const text = JSON.parse(data.Body).article

    const url = `${NLP_URL}?language=de&analysis=dict&models=mendelsohnDictionary_PER&outformat=json-ld&informat=text`

    logger.log(`Try to fetch data from ${url}`)
    const nlpResult = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        input: text
      })
    })

    if (!nlpResult.ok) {
      throw new Error(`Failed fetching ${url} - ${nlpResult.status} ${nlpResult.statusText}`)
    }

    const nlpJSON = await nlpResult.json()
    const fileName = `nlpRequest/out/${awsRequestId}.json`

    logger.log(`put extracted text '${fileName}' to '${s3.bucket}'`)
    const s3Response = await s3.putObject({
      Key: fileName,
      Body: JSON.stringify({ nlpJSON })
    })
    const succeedResponse = Object.assign({}, s3Response, {
      Key: fileName
    })

    logger.log('NLP Request succeeded')
    callback(null, JSON.stringify(succeedResponse))
  } catch (err) {
    callback(err)
  }
}
