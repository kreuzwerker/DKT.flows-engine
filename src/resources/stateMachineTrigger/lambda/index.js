import Logger from '../../../utils/logger'
import S3 from '../../../utils/s3'


/*
 * Trigger StateMachine
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)
  const s3 = S3(process.env.S3_BUCKET)

  try {
    // TODO
    logger.log('ok!')
    callback(null, JSON.stringify('ok!'))
  } catch (err) {
    callback(err)
  }
}
