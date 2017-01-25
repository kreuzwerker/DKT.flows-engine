import { graphql } from 'graphql'
import _isString from 'lodash/isString'
import Logger from '../../../utils/logger'
import Schema from './schema'

/*
 * graphql service
 */
export async function post(event, context) {
  const logger = Logger(event.verbose)

  try {
    const body = _isString(event.body) ? JSON.parse(event.body) : event.body

    logger.log('Query:', body.query)

    const response = await graphql(Schema, body.query)

    logger.log('Result:', response)

    context.succeed({
      'statusCode': 200,
      'body': JSON.stringify(response)
    })
  } catch (err) {
    logger.log('Error:', err)
    context.fail(err)
  }
}
