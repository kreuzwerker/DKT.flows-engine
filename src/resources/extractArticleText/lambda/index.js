import extractor from 'unfluff'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import { getFlowRunData, flowRunStepSuccessHandler } from '../../../utils/helpers/flowRunHelpers'


/*
 * Extract article text with node unfluff
 */
export async function handler(event, context, callback) {
  const logger = Logger()
  const input = _isString(event) ? JSON.parse(event) : event
  input.currentStep += 1

  try {
    const flowRunData = await getFlowRunData(input)
    const inputData = flowRunData[input.contentKey]

    logger.log('parsing and extracting text from article')
    const article = extractor.lazy(inputData)
    const text = article.text()

    const output = await flowRunStepSuccessHandler(input, flowRunData, text)
    callback(null, output)
  } catch (err) {
    logger.log(err)
    const output = Object.assign({}, input, { error: err })
    callback(null, output)
  }
}
