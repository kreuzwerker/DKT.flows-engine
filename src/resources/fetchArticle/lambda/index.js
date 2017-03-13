import fetch from 'node-fetch'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import { getFlowRunData, serviceSuccessHandler } from '../../../utils/flowRunHelpers'


/*
 * Fetch an Article from given URL
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event
  input.currentStep += 1

  try {
    const flowRunData = await getFlowRunData(input)
    const inputData = flowRunData[input.contentKey]

    logger.log(`Try to fetch data from ${inputData}`)
    const result = await fetch(inputData)

    if (!result.ok) {
      throw new Error(`Failed fetching ${inputData} - ${result.status} ${result.statusText}`)
    }

    logger.log('Extract HTML')
    let articleHTML = await result.text()
    articleHTML = articleHTML.replace(/(\r\n|\n|\r|\t)/gm, '')

    const output = await serviceSuccessHandler(input, flowRunData, articleHTML)
    callback(null, output)
  } catch (err) {
    const output = Object.assign({}, input, { error: err })
    callback(null, output)
  }
}
