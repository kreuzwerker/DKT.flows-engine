import service from '../../../../utils/service'
const JSONPath = require('jsonpath-plus');

/*
 * Parse JSON from given string
 */
async function parseJson(jsonString, jsonPath, logger) {
  let result = {}

  try {
    logger.log(`Try to parse JSON from string`)
    var json = JSON.parse(jsonString);
  } catch (err) {
    logger.log('Error while parsing JSON string', err)
    return Promise.reject(err)
  }

  try {
    logger.log('Extract json from given path')
    result = JSONPath({json: json, path: jsonPath});
  } catch (err) {
    logger.log('Error while getting json for given path', err)
    return Promise.reject(err)
  }

  return result[0]
}

export const handler = service(parseJson)

// Test function locally
// parseJson('{"test": "Success"}', '$.test', console).then((res) => {
//   console.log(res);
// }).catch((err) => {
//   console.log("ERROR", err);  
// })
