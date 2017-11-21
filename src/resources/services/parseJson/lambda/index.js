import JSONPath from 'jsonpath-plus'
import service from '../../../../utils/service'

/*
 * Return a json fragment for the given json path from the given json string or object
 */
function parseJson(json, { configParams }, logger) {
  let result = {}
  const path = configParams.get('path')

  if (typeof json === 'string') {
    try {
      logger.log('Try to parse JSON from string')
      json = JSON.parse(json) // eslint-disable-line
    } catch (err) {
      logger.log('Error while parsing JSON string', err)
      return Promise.reject(err)
    }
  }

  try {
    logger.log(`Extract json from given path ${path}`)
    result = JSONPath({ json, path })
  } catch (err) {
    logger.log('Error while getting json for given path', err)
    return Promise.reject(err)
  }

  logger.log('result', result)

  return Promise.resolve(result)
}

export const handler = service(parseJson)

// Test functionn locally
// const testStr =
//   '{"store":{"book":[{"category":"reference","author":"Nigel Rees","title":"Sayings of the Century","price":8.95},{"category":"fiction","author":"Evelyn Waugh","title":"Sword of Honour","price":12.99},{"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99},{"category":"fiction","author":"J. R. R. Tolkien","title":"The Lord of the Rings","isbn":"0-395-19395-8","price":22.99}],"bicycle":{"color":"red","price":19.95}}}'
// const path = '$.store.book[*].author'
//
// parseJson(testStr, { configParams: { get: () => path } }, console).catch((err) => {
//   console.log('ERROR', err)
// })
