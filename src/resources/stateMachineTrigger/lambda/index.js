import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import S3 from '../../../utils/s3'
import StepFunctions from '../../../utils/stepFunctions'
import { flowRunErrorHandler } from '../../../utils/helpers/flowRunHelpers'


export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const input = _isString(event) ? JSON.parse(event) : event
  input.currentStep = 0 // trigger is always 0
  console.log(`Starting StateMachine: '${input.stateMachineArn}'`)

  try {
    const response = await StepFunctions.startExecution(input.stateMachineArn, JSON.stringify(event))

    logger.log(`Started StateMachine: '${input.stateMachineArn}'`, response)

    callback(null, JSON.stringify(response))
  } catch (err) {
    logger.log(`Unable to start StateMachine: '${input.stateMachineArn}'`, err)
    flowRunErrorHandler(err, input).then(result => callback(result))
  }
}
