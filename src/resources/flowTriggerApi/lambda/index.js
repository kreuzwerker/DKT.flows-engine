import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import StepFunctions from '../../../utils/stepFunctions'


const corsHeader = {
  'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Origin': '*'
}


export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)

  try {
    const body = _isString(event.body) ? JSON.parse(event.body) : event.body
    logger.log('Query:', body)

    const { flow } = body
    const response = await StepFunctions.startExecution(flow)

    if (response.errors) {
      callback(null, {
        'statusCode': 500,
        'headers': corsHeader,
        'body': JSON.stringify(response)
      })
    } else {
      callback(null, {
        'statusCode': 200,
        'headers': corsHeader,
        'body': JSON.stringify(response)
      })
    }
  } catch (err) {
    logger.log('Error:', err)
    callback({
      'statusCode': 500,
      'headers': corsHeader,
      'body': JSON.stringify({ errors: err })
    })
  }
}
