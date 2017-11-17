import fetch from 'node-fetch'
import service from '../../../../utils/service'

/*
 * Fetch Text from given URL
 */
async function fetchText(inputData, data, logger) {
  let result = {},
      text = {}

  try {
    logger.log(`Try to fetch data from ${inputData}`)
    result = await fetch(inputData)

    if (!result.ok) {
      console.log('** ERROR **')
      throw new Error(`Failed fetching ${inputData} - ${result.status} ${result.statusText}`)
    }
  } catch (err) {
    logger.log('Error while fetching', err)
    return Promise.reject(err)
  }

  try {
    logger.log('Extract Text')
    text = await result.text()
  } catch (err) {
    logger.log('Error while getting text', err)
    return Promise.reject(err)
  }

  text = text.replace(/(\r\n|\n|\r|\t)/gm, '')

  return text
}

export const handler = service(fetchText)
