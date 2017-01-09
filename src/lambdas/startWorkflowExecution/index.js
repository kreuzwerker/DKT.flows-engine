import _isString from 'lodash/isString'
import Logger from '../../utils/logger'
import StepFunctions from '../../utils/stepFunctions'


/*
 * Execute workflow state machine
 */
export async function handler(event, context, callback) {
  const { workflow, verbose } = _isString(event) ? JSON.parse(event) : event
  const logger = Logger(verbose)

  try {
    logger.log(`start ${workflow} execution`)
    const data = await StepFunctions.startExecution(workflow)
    callback(null, JSON.stringify(data))
  } catch (err) {
    callback(err)
  }
}
