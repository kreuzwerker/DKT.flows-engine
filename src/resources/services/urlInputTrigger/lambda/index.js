import _isString from 'lodash/isString'
import Logger from '../../../../utils/logger'
import { triggerFlowRun } from '../../../../utils/helpers/flowRunHelpers'


export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event
  logger.log('Input:', input)

  try {
    const currentStep = input.flowRun.flow.steps.reduce((a, step) => {
      return step.service.type === 'TRIGGER' ? step : a
    }, {})

    const url = currentStep.configParams.reduce((a, param) => {
      if (param.fieldId === 'url-input') {
        return param.value
      }
      return a
    }, '')

    triggerFlowRun(input.flowRun, url)
      .then(result => callback(null, result))
  } catch (err) {
    logger.log('Error:', err)
    callback(err)
  }
}
