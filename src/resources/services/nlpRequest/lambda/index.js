import fetch from 'node-fetch'
import _isString from 'lodash/isString'
import S3 from '../../../../utils/s3'
import service from '../../../../utils/service'

async function nlpRequest(inputData, logger, { event, context }) {
  const { NLP_URL, S3_BUCKET } = process.env
  const { Key } = _isString(event) ? JSON.parse(event) : event
  const { awsRequestId } = context
  const s3 = S3(S3_BUCKET)
  let data = {},
      s3Response = {},
      nlpResult = {},
      nlpJSON = {}

  try {
    logger.log(`Get '${Key}' from '${s3.bucket}'`)
    data = await s3.getObject({ Key })
  } catch (e) {
    logger.log('Error while getting data from S3')
    return Promise.reject(e)
  }

  const text = JSON.parse(data.Body).article
  const url = `${NLP_URL}?language=de&analysis=dict&models=mendelsohnDictionary_PER&outformat=json-ld&informat=text`

  try {
    logger.log(`Try to fetch data from ${url}`)
    nlpResult = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        input: text
      })
    })
  } catch (e) {
    logger.log('Error while NLP request')
    return Promise.reject(e)
  }

  if (!nlpResult.ok) {
    return Promise.reject(`Failed fetching ${url} - ${nlpResult.status} ${nlpResult.statusText}`)
  }

  try {
    nlpJSON = await nlpResult.json()
  } catch (e) {
    return Promise.reject(e)
  }

  const fileName = `nlpRequest/out/${awsRequestId}.json`

  try {
    logger.log(`put extracted text '${fileName}' to '${s3.bucket}'`)
    s3Response = await s3.putObject({
      Key: fileName,
      Body: JSON.stringify({ nlpJSON })
    })
  } catch (e) {
    return Promise.reject(e)
  }

  const succeedResponse = Object.assign({}, s3Response, {
    Key: fileName
  })

  logger.log('NLP Request succeeded')
  return succeedResponse
}

export const handler = service(nlpRequest)
