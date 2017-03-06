import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import StepFunctions from '../../../utils/stepFunctions'


export async function handler(event, context, callback) {
  const logger = Logger()
  const { stateMachine } = _isString(event) ? JSON.parse(event) : event
  try {
    logger.log(`Starting StateMachine: '${stateMachine}'`)
    const response = await StepFunctions.startExecution(stateMachine, JSON.stringify(event))
    logger.log(`Started StateMachine: '${stateMachine}'`, response)
    callback(null, JSON.stringify(response))
  } catch (err) {
    logger.log(`Unable to start StateMachine: '${stateMachine}'`, err)
    callback(err)
  }
}
