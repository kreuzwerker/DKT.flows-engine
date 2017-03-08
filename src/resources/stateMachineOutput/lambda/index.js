import _isString from 'lodash/isString'
import uuid from 'uuid'
import Logger from '../../../utils/logger'
import S3 from '../../../utils/s3'
import { flowRunSuccessHandler, getFlowRunData, errorHandler } from '../../../utils/flowRunHelpers'


export async function handler(event, context, callback) {
  const logger = Logger()
  const s3 = S3(process.env.S3_BUCKET)
  const input = _isString(event) ? JSON.parse(event) : event

  console.log(JSON.stringify(input, null, 2))

  try {
    if (input.error) {
      logger.log(input.error)
      const result = await errorHandler(input.error, input.input)
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
