import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import StepFunctions from '../../../utils/stepFunctions'

export async function handler(event, context, callback) {
  const logger = Logger()
  const input = _isString(event) ? JSON.parse(event) : event

  logger.log(input)

  callback(null, 'foobar')
}
