import fetch from 'node-fetch'
import _isString from 'lodash/isString'
import Logger from '../../../../utils/logger'
import { flowRunStepSuccessHandler } from '../../../../utils/helpers/flowRunHelpers'
import {
  getStepData,
  testStepSuccessHandler,
  testStepErrorHandler
} from '../../../../utils/helpers/stepHelpers'

/*
 * Fetch an Article from given URL
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event
  let stepData = {},
      output = {}

  input.currentStep += 1

  try {
    stepData = await getStepData(input)
    const inputData = stepData[input.contentKey]

    logger.log(`Try to fetch data from ${inputData}`)
    const result = await fetch(inputData)

    if (!result.ok) {
      console.log('** ERROR **')
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

    callback(null, output)
  } catch (err) {
    if (input.testStep) {
      testStepErrorHandler(input, stepData, err).then(errorOutput => callback(null, errorOutput))
    } else {
      output = Object.assign({}, input, { error: err })
      callback(null, output)
    }
  }
}
