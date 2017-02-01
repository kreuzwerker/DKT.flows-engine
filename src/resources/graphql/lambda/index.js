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

    callback(null, {
      'statusCode': 200,
      'body': JSON.stringify(response)
    })
  } catch (err) {
    logger.log('Error:', err)
    callback(err)
  }
}
