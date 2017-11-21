import _isString from 'lodash/isString'
import Logger from '../../../../utils/logger'
import { triggerFlowRun } from '../../../../utils/helpers/flowRunHelpers'

export async function handler(event, context, callback) {
  event.verbose = true
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event
  const url = input.configParams.find(param => param.fieldId === 'url-input').value

  logger.log(`Trigger FlowRun '${input.flowRun.id}' with url: ${url}`)

  try {
    const result = await triggerFlowRun(input.flowRun, url)
    logger.log('Triggered FlowRun')
    callback(null, result)
  } catch (err) {
    const result = Object.assign({}, input, { error: err })
    logger.log('Error:', err)
    callback(null, result)
  }
}
