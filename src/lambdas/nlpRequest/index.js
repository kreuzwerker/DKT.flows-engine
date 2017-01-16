import fetch from 'node-fetch'
import _isString from 'lodash/isString'
import Logger from '../../utils/logger'
import S3 from '../../utils/s3'


const NLP_URL = 'http://kreuzwerker-dkt-nlp-loadbalancer-1465345853.eu-west-1.elb.amazonaws.com/e-nlp/namedEntityRecognition'

/*
 * Fetch an Article from given URL
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)

  try {
    const { Key } = _isString(event) ? JSON.parse(event) : event
    const { awsRequestId } = context

    logger.log(`Get '${Key}' from '${S3.bucket}'`)

    const data = await S3.getObject({ Key })
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

    logger.log(`put extracted text '${fileName}' to '${S3.bucket}'`)
    const s3Response = await S3.putObject({
      Key: fileName,
      Body: JSON.stringify({ nlpJSON })
    })
    const succeedResponse = Object.assign({}, s3Response, {
      Key: fileName
    })

    logger.log('NLP Request succeeded')
    callback(null, succeedResponse)
  } catch (err) {
    callback(err)
  }
}
