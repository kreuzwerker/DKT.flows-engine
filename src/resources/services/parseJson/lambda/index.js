import _isString from 'lodash/isString'
import JSONPath from 'jsonpath-plus'
import service from '../../../../utils/service'

/*
 * Parse JSON from given string or object
 */
async function parseJson(input, logger, { stepData }) {
  let result = {},
      json = null

  logger.log('DEBUG stepData', stepData)
  logger.log('DEBUG input', input)

  // Get step config
  // TODO where are the step config params when the service was triggered in the
  // context of 'Test step'? In this context, there is no stepData.flowRun
  // available.
  const configParams = stepData.flowRun
    ? stepData.flowRun.flow.steps[stepData.currentStep].configParams
    : []
  // logger.log('DEBUG configParams', configParams);
  const path = configParams.reduce((a, param) => {
    return param.fieldId === 'path' ? param.value : a
  }, '')

  if (typeof input.json === 'undefined') {
    return Promise.reject("Missing required 'json' parameter.")
  } else if (_isString(input.json)) {
    try {
      logger.log('Try to parse JSON from string')
      json = JSON.parse(input.json)
    } catch (err) {
      logger.log('Error while parsing JSON string', err)
      return Promise.reject(err)
    }
  } else {
    json = input.json
  }

  try {
    logger.log(`Extract json from given path ${path}`)
    result = JSONPath({ json: json, path: path })
  } catch (err) {
    logger.log('Error while getting json for given path', err)
    return Promise.reject(err)
  }

  logger.log('DEBUG result', result[0])

  return result[0]
}

export const handler = service(parseJson)

// Test function locally
// parseJson({
//   'json': '{"test": "Success"}',
//   'path': '$.test'
// }, console).then((res) => {
//   console.log(res);
// }).catch((err) => {
//   console.log("ERROR", err);
// })
