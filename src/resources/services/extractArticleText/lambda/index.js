import extractor from 'unfluff'
import service from '../../../../utils/service'

/*
 * Extract article text with node unfluff
 */
function extractArticle(inputData, data, logger) {
  return new Promise((resolve, reject) => {
    let article = '',
        text = ''

    logger.log('parsing and extracting text from article')

    try {
      article = extractor.lazy(inputData)
      text = article.text()
      resolve(text)
    } catch (e) {
      logger.log('Error while extracting text from article')
      reject(e)
    }
  })
}

export const handler = service(extractArticle)
