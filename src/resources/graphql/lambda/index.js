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
    logger.log('Mutation:', body.mutation)

    let response = {}

    if (body.query) {
      response = await graphql(Schema, body.query)
    } else if (body.mutation) {
      response = await graphql(Schema, body.mutation)
    }

    logger.log('Result:', response)

    callback(null, {
      'statusCode': 200,
      'body': JSON.stringify(response)
    })
  } catch (err) {
    logger.log('Error:', err)
    callback(err)
  }
}
