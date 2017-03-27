import fetch from 'node-fetch'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import { flowRunStepSuccessHandler } from '../../../utils/helpers/flowRunHelpers'
import { getStepData, testStepSuccessHandler } from '../../../utils/helpers/stepHelpers'

/*
 * Fetch an Article from given URL
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event
  let output = {}

  input.currentStep += 1

  try {
    const stepData = await getStepData(input)
    const inputData = stepData[input.contentKey]

    logger.log(`Try to fetch data from ${inputData}`)
    const result = await fetch(inputData)

    if (!result.ok) {
      throw new Error(`Failed fetching ${inputData} - ${result.status} ${result.statusText}`)
    }

    logger.log('Extract HTML')
    let articleHTML = await result.text()
    articleHTML = articleHTML.replace(/(\r\n|\n|\r|\t)/gm, '')

    if (input.testStep) {
      output = await testStepSuccessHandler(input, stepData, articleHTML)
    } else {
      output = await flowRunStepSuccessHandler(input, stepData, articleHTML)
    }

    console.log('STRINGIFIED OUTPUT', output)
    callback(null, output)
  } catch (err) {
    output = Object.assign({}, input, { error: err })
    callback(null, output)
  }
}
