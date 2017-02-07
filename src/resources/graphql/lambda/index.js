import { graphql } from 'graphql'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import Schema from './schema'

/*
 * graphql service
 */
export async function handler(event, context, callback) {
  const logger = Logger(event.verbose)

  try {
    const body = _isString(event.body) ? JSON.parse(event.body) : event.body
    logger.log('Query:', body.query)

    const response = await graphql(Schema, body.query)
    logger.log('Result:', JSON.stringify(response, null, 2))

    if (response.errors) {
      callback(null, {
        'statusCode': 500,
        'body': JSON.stringify({ errors: response.errors })
      })
    } else {
      callback(null, {
        'statusCode': 200,
        'headers': {
          'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Origin': '*'
        },
        'body': JSON.stringify(response)
      })
    }
  } catch (err) {
    logger.log('Error:', err)
    callback(err)
  }
}
