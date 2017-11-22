import fetch from 'node-fetch'
import service from '../../../../utils/service'

/*
 * Named Entity Recognition with spacy
 */
async function spacyNer(inputData, { configParams }, logger) {
  const { SPACY_SERVICE_URL } = process.env
  const model = configParams.get('model') || 'en_core_web_sm'

  let nerResult = {},
      nerJSON = {}

  try {
    nerResult = await fetch(SPACY_SERVICE_URL, {
      method: 'POST',
      body: JSON.stringify({
        text: inputData,
        model: model,
        o: 'json'
      })
    })
    if (!nerResult.ok) {
      return Promise.reject(
        `Failed fetching ${SPACY_SERVICE_URL} - ${nerResult.status} ${nerResult.statusText}`
      )
    }
  } catch (error) {
    logger.log('Error while requesting result from spacy-ner', error)
    return Promise.reject(error)
  }

  try {
    nerJSON = await nerResult.json()
  } catch (error) {
    return Promise.reject(error)
  }
  return nerJSON
}

export const handler = service(spacyNer)
// export const handler = spacyNer // TODO: service() doesn't work well with the tests
