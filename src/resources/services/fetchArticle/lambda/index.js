import fetch from 'node-fetch'
import service from '../../../../utils/service'

/*
 * Fetch an Article from given URL
 */
async function fetchArticle(inputData, logger) {
  let output = {},
      result = {},
      articleHTML = {}

  try {
    logger.log(`Try to fetch data from ${inputData}`)
    result = await fetch(inputData)

    if (!result.ok) {
      console.log('** ERROR **')
      throw new Error(`Failed fetching ${inputData} - ${result.status} ${result.statusText}`)
    }
  } catch (err) {
    logger.log('Error while fetching article', err)
    return Promise.reject(err)
  }

  try {
    logger.log('Extract HTML')
    articleHTML = await result.text()
  } catch (err) {
    logger.log('Error while getting article html', err)
    return Promise.reject(err)
  }

  articleHTML = articleHTML.replace(/(\r\n|\n|\r|\t)/gm, '')

  return articleHTML
}

export const handler = service(fetchArticle)
