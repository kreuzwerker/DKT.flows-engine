import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import S3 from '../../../utils/s3'
import StepFunctions from '../../../utils/stepFunctions'
import { errorHandler } from '../../../utils/flowRunHelpers'


export async function handler(event, context, callback) {
  const logger = Logger()
  const input = _isString(event) ? JSON.parse(event) : event
  input.currentStep = 0 // trigger is always 0
  logger.log(`Starting StateMachine: '${input.stateMachine}'`)

  try {
    const response = await StepFunctions.startExecution(input.stateMachine, JSON.stringify(event))

    logger.log(`Started StateMachine: '${input.stateMachine}'`, response)

    callback(null, JSON.stringify(response))
  } catch (err) {
    logger.log(`Unable to start StateMachine: '${input.stateMachine}'`, err)
    errorHandler(err, input).then(result => callback(result))
  }
}
