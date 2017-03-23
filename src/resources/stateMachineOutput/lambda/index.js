import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import { flowRunSuccessHandler, getFlowRunData, flowRunErrorHandler } from '../../../utils/helpers/flowRunHelpers'


export async function handler(event, context, callback) {
  const logger = Logger()
  const input = _isString(event) ? JSON.parse(event) : event

  try {
    if (input.error) {
      logger.log(input.error)

      const result = await flowRunErrorHandler(input.error, input)
      callback(null, result)
    } else {
      logger.log(input)
      const flowRunData = await getFlowRunData(input)
      const result = await flowRunSuccessHandler(input, flowRunData)
      callback(null, result)
    }
  } catch (err) {
    callback(err)
  }
}
