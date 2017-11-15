import JSONPath from 'jsonpath-plus'
import service from '../../../../utils/service'

/*
 * Return a json fragment for the given json path from the given json string or object
 */
function parseJson(json, logger, { stepData }) {
  let result = {}

  logger.log('DEBUG stepData', stepData)
  logger.log('DEBUG json', json);

  // Get step config
  const stepIndex = typeof stepData.currentStep !== 'undefined' ? stepData.currentStep : 0;
  if (!stepData.flowRun || !stepData.flowRun.flow.steps[stepIndex]) {
    return Promise.reject(new Error('Missing step config params.'))
  }

  const configParams = stepData.flowRun.flow.steps[stepIndex].configParams;
  logger.log('DEBUG configParams', configParams);

  const path = configParams.reduce((a, param) => {
    return Promise.reoslve(param.fieldId === 'path' ? param.value : a)
  }, '')

  if (typeof json === 'string') {
    try {
      logger.log('Try to parse JSON from string');
      json = JSON.parse(json);
    } catch (err) {
      logger.log('Error while parsing JSON string', err)
      return Promise.reject(err)
    }
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
