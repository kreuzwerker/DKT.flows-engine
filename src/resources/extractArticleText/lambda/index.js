import extractor from 'unfluff'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import { flowRunStepSuccessHandler } from '../../../utils/helpers/flowRunHelpers'
import { getStepData, testStepSuccessHandler, testStepErrorHandler } from '../../../utils/helpers/stepHelpers'


/*
 * Extract article text with node unfluff
 */
export async function handler(event, context, callback) {
  const logger = Logger()
  const input = _isString(event) ? JSON.parse(event) : event
  let stepData = {},
      output = {}

  input.currentStep += 1

  try {
    stepData = await getStepData(input)
    const inputData = stepData[input.contentKey]

    logger.log('parsing and extracting text from article')
    const article = extractor.lazy(inputData)
    const text = article.text()

    if (input.testStep) {
      output = await testStepSuccessHandler(input, stepData, text)
    } else {
      output = await flowRunStepSuccessHandler(input, stepData, text)
    }

    callback(null, output)
  } catch (err) {
    logger.log(err)

    if (input.testStep) {
      testStepErrorHandler(input, stepData, err)
        .then(errorOutput => callback(null, errorOutput))
    } else {
      output = Object.assign({}, input, { error: err })
      callback(null, output)
    }
  }
}
