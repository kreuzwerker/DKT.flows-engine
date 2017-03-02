import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import S3 from '../../../utils/s3'
import StepFunctions from '../../../utils/stepFunctions'


/*
 * Trigger StateMachine
 *
 * This functions requires a json document on S3 with a stateMachone and a input key. e.g.
 * {
 *    stateMachine: "testMachine",
 *    input: {
 *      Key: "<bucket>/<key>"
 *    }
 * }
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const s3 = S3(process.env.S3_BUCKET)

  try {
    const { Key } = _isString(event) ? JSON.parse(event) : event
    const { awsRequestId } = context

    logger.log(`Get '${Key}' from '${s3.bucket}'`)
    const data = await s3.getObject({ Key })

    const { stateMachine, input } = JSON.parse(data.Body)
    const response = await StepFunctions.startExecution(stateMachine, JSON.stringify(input))

    callback(null, JSON.stringify(response))
  } catch (err) {
    callback(err)
  }
}
