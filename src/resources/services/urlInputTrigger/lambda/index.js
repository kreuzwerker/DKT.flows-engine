import _isString from 'lodash/isString'
import Logger from '../../../../utils/logger'
import { triggerFlowRun } from '../../../../utils/helpers/flowRunHelpers'

function triggerStepReducer(a, step) {
  return step.service.type === 'TRIGGER' ? step : a
}

function urlValueReducer(a, param) {
  return param.fieldId === 'url-input' ? param.value : a
}

export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event
  const steps = input.flowRun.flow.steps || []
  const currentStep = steps.reduce(triggerStepReducer, {})
  const url = currentStep.configParams.reduce(urlValueReducer, '')

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
